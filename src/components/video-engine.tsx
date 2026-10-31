import { useEffect, useRef, useState, type DragEvent } from "react";
import { Camera, Captions, Download, FilePlus2, Gauge, Link2, ListVideo, Loader2, PictureInPicture2, Repeat, X } from "lucide-react";

// The Video Engine plays videos the browser can't play by itself.
// - Files and links the browser understands (mp4, webm, ogg, mp3...) play straight away.
// - Live and streaming links (.m3u8) play through hls.js.
// - Other formats (mkv, avi, wmv, flv, mov, mpg, ts, 3gp...) are converted in this browser with
//   ffmpeg.wasm (mp4, or WebM where the browser has no H.264): first a fast copy of the streams into mp4, and a full conversion only if that won't play.
// Links are fetched through the PRIVATE OS proxy engine when one is given, so they play where the site
// itself is blocked. ffmpeg and hls.js load from a CDN only the first time they are needed.

const CDN = "https://cdn.jsdelivr.net/npm";
const FFMPEG = `${CDN}/@ffmpeg/ffmpeg@0.12.15/dist/esm`;
const FFMPEG_CORE = `${CDN}/@ffmpeg/core@0.12.10/dist/esm`;
const HLS = `${CDN}/hls.js@1.6.13/dist/hls.mjs`;

const NATIVE = /\.(mp4|m4v|webm|ogv|ogg|mp3|m4a|aac|wav|opus|flac)$/i;
const STREAM = /\.m3u8$/i;
const CONVERT = /\.(mkv|avi|wmv|flv|mov|mpg|mpeg|ts|m2ts|mts|3gp|3g2|vob|f4v|asf|rm|rmvb|divx|xvid)$/i;
export const VIDEO_LINK = /\.(mp4|m4v|webm|ogv|mkv|avi|wmv|flv|mov|mpg|mpeg|m3u8|ts|3gp)(\?.*)?$/i;

type FFmpeg = {
  load: (options: { coreURL: string; wasmURL: string; classWorkerURL: string }) => Promise<boolean>;
  exec: (args: string[]) => Promise<number>;
  writeFile: (name: string, data: Uint8Array) => Promise<boolean>;
  readFile: (name: string) => Promise<Uint8Array | string>;
  deleteFile: (name: string) => Promise<boolean>;
  on: (event: "progress", callback: (data: { progress: number }) => void) => void;
  off: (event: "progress", callback: (data: { progress: number }) => void) => void;
};
type HlsInstance = { loadSource: (url: string) => void; attachMedia: (media: HTMLMediaElement) => void; destroy: () => void; on: (event: string, callback: (event: string, data: { fatal?: boolean; details?: string }) => void) => void };
type HlsClass = { new (config: { xhrSetup?: (xhr: XMLHttpRequest, url: string) => void }): HlsInstance; isSupported: () => boolean; Events: { ERROR: string } };

let ffmpegTask: Promise<FFmpeg> | null = null;
function loadFFmpeg() {
  ffmpegTask ??= (async () => {
    const { FFmpeg } = (await import(/* @vite-ignore */ `${FFMPEG}/index.js`)) as { FFmpeg: new () => FFmpeg };
    // A worker can't start from another site, so a tiny same-origin module starts the CDN worker.
    const worker = URL.createObjectURL(new Blob([`import "${FFMPEG}/worker.js";`], { type: "text/javascript" }));
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({ coreURL: `${FFMPEG_CORE}/ffmpeg-core.js`, wasmURL: `${FFMPEG_CORE}/ffmpeg-core.wasm`, classWorkerURL: worker });
    return ffmpeg;
  })().catch((error: unknown) => {
    ffmpegTask = null;
    throw error;
  });
  return ffmpegTask;
}

let hlsTask: Promise<HlsClass> | null = null;
const loadHls = () => (hlsTask ??= import(/* @vite-ignore */ HLS).then((module: { default: HlsClass }) => module.default));

const nameOf = (url: string) => {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || url);
  } catch {
    return url;
  }
};

// Browsers without H.264 (Chromium, some Linux builds) get WebM from the engine instead of mp4.
const playsMp4 = () => typeof document !== "undefined" && document.createElement("video").canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') !== "";

// SubRip subtitles become WebVTT, which is what the video element reads.
const srtToVtt = (text: string) => "WEBVTT\n\n" + text.replace(/\r/g, "").replace(/(\d\d:\d\d:\d\d),(\d\d\d)/g, "$1.$2");

type Item = { id: string; name: string; source: { file: File } | { url: string } };
type Playing = { src: string; kind: "native" | "hls" | "converted"; note?: string };

export function VideoEngine({ initialUrl, proxyUrl, onTitle }: { initialUrl?: string | undefined; proxyUrl?: ((url: string) => Promise<string>) | undefined; onTitle?: ((title: string) => void) | undefined }) {
  const video = useRef<HTMLVideoElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const subInput = useRef<HTMLInputElement>(null);
  const hls = useRef<HlsInstance | null>(null);
  const made = useRef<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Playing | null>(null);
  const [busy, setBusy] = useState<{ label: string; progress: number | null } | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [list, setList] = useState(true);
  const [drag, setDrag] = useState(false);
  const [subs, setSubs] = useState<string | null>(null);

  const keep = (url: string) => {
    made.current.push(url);
    return url;
  };
  useEffect(() => () => {
    hls.current?.destroy();
    made.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);
  useEffect(() => {
    if (video.current) video.current.playbackRate = speed;
  }, [speed, playing]);

  // Through the proxy first; a site that allows it is fetched directly when the proxy can't reach it.
  const fetchBytes = async (url: string) => {
    const targets = proxyUrl ? [await proxyUrl(url), url] : [url];
    let problem = "";
    for (const target of [...new Set(targets)]) {
      const response = await fetch(target).catch(() => null);
      if (response?.ok) return new Uint8Array(await response.arrayBuffer());
      problem ||= response ? `The link answered ${response.status}` : "The link couldn't be reached";
    }
    throw new Error(problem);
  };

  // Copies the streams into mp4 (seconds), or converts them fully when copying can't make a playable file.
  const convert = async (name: string, bytes: Uint8Array) => {
    const mp4 = playsMp4();
    const out = mp4 ? "out.mp4" : "out.webm";
    setBusy({ label: "Starting the video engine", progress: null });
    const ffmpeg = await loadFFmpeg();
    const onProgress = ({ progress }: { progress: number }) => setBusy((value) => (value ? { ...value, progress: Math.max(0, Math.min(1, progress)) } : value));
    ffmpeg.on("progress", onProgress);
    const input = `in.${name.split(".").pop() || "bin"}`;
    try {
      await ffmpeg.writeFile(input, bytes);
      setBusy({ label: "Preparing the video", progress: 0 });
      let code = mp4 ? await ffmpeg.exec(["-i", input, "-map", "0:v:0?", "-map", "0:a:0?", "-c", "copy", "-movflags", "+faststart", out]) : 1;
      let data = code === 0 ? await ffmpeg.readFile(out) : null;
      let url = data && typeof data !== "string" && data.length > 0 ? URL.createObjectURL(new Blob([data.slice()], { type: "video/mp4" })) : null;
      if (!url || !(await playable(url))) {
        if (url) URL.revokeObjectURL(url);
        setBusy({ label: "Converting the video (this can take a while)", progress: 0 });
        code = await ffmpeg.exec(
          mp4
            ? ["-i", input, "-c:v", "libx264", "-preset", "ultrafast", "-crf", "26", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-y", out]
            : ["-i", input, "-c:v", "libvpx", "-deadline", "realtime", "-cpu-used", "8", "-b:v", "2M", "-c:a", "libopus", "-b:a", "128k", "-y", out],
        );
        if (code !== 0) throw new Error("This file couldn't be converted.");
        data = await ffmpeg.readFile(out);
        if (typeof data === "string") throw new Error("This file couldn't be converted.");
        url = URL.createObjectURL(new Blob([data.slice()], { type: mp4 ? "video/mp4" : "video/webm" }));
      }
      return keep(url);
    } finally {
      ffmpeg.off("progress", onProgress);
      await ffmpeg.deleteFile(input).catch(() => false);
      await ffmpeg.deleteFile(out).catch(() => false);
    }
  };

  const open = async (item: Item) => {
    setCurrent(item.id);
    setError("");
    setSubs(null);
    hls.current?.destroy();
    hls.current = null;
    setPlaying(null);
    onTitle?.(item.name);
    try {
      if ("file" in item.source) {
        const file = item.source.file;
        const direct = keep(URL.createObjectURL(file));
        if (!CONVERT.test(file.name) && (await playable(direct))) return setPlaying({ src: direct, kind: "native" });
        const src = await convert(file.name, new Uint8Array(await file.arrayBuffer()));
        return setPlaying({ src, kind: "converted", note: "Converted by the video engine" });
      }
      const url = item.source.url;
      if (STREAM.test(new URL(url).pathname)) {
        return setPlaying({ src: `hls:${url}`, kind: "hls", note: "Stream" });
      }
      if (CONVERT.test(new URL(url).pathname)) {
        setBusy({ label: "Downloading the video", progress: null });
        const src = await convert(nameOf(url), await fetchBytes(url));
        return setPlaying({ src, kind: "converted", note: "Converted by the video engine" });
      }
      const src = proxyUrl ? await proxyUrl(url) : url;
      setPlaying({ src, kind: "native" });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "This video couldn't be opened.");
    } finally {
      setBusy(null);
    }
  };

  // hls.js is attached once the video element for the stream is on the page.
  useEffect(() => {
    const element = video.current;
    if (!element || playing?.kind !== "hls") return;
    const url = playing.src.slice(4);
    let cancelled = false;
    void (async () => {
      const Hls = await loadHls();
      if (cancelled) return;
      if (!Hls.isSupported()) {
        element.src = proxyUrl ? await proxyUrl(url) : url;
        return;
      }
      // Every playlist and segment request goes through the proxy too.
      const encode = proxyUrl ? await proxyRewriter(proxyUrl, url) : null;
      const instance = new Hls(encode ? { xhrSetup: (xhr, target) => xhr.open("GET", encode(target), true) } : {});
      hls.current = instance;
      instance.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setError(`The stream stopped (${data.details ?? "error"}).`);
      });
      instance.loadSource(url);
      instance.attachMedia(element);
      void element.play().catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [playing, proxyUrl]);

  const add = (next: Item[], play = true) => {
    if (next.length === 0) return;
    setItems((value) => [...value, ...next]);
    if (play) void open(next[0]!);
  };
  const addFiles = (files: FileList | File[]) => {
    const all = [...files];
    const subtitle = all.find((file) => /\.(srt|vtt)$/i.test(file.name));
    const videos = all.filter((file) => !/\.(srt|vtt)$/i.test(file.name));
    add(videos.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, name: file.name, source: { file } })));
    if (subtitle) void loadSubs(subtitle);
  };
  const addLink = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    let url: string;
    try {
      url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).href;
    } catch {
      return setError("That isn't a link.");
    }
    add([{ id: `${url}-${Math.random()}`, name: nameOf(url), source: { url } }]);
    setLink("");
  };
  const loadSubs = async (file: File) => {
    const text = await file.text();
    setSubs(keep(URL.createObjectURL(new Blob([/\.srt$/i.test(file.name) ? srtToVtt(text) : text], { type: "text/vtt" }))));
  };

  useEffect(() => {
    if (initialUrl) addLink(initialUrl);
    // only the first link given to the engine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl]);

  const snapshot = () => {
    const element = video.current;
    if (!element || !element.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = element.videoWidth;
    canvas.height = element.videoHeight;
    canvas.getContext("2d")?.drawImage(element, 0, 0);
    canvas.toBlob((blob) => blob && save(blob, "frame.png"));
  };
  const save = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = Object.assign(document.createElement("a"), { href: url, download: name });
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };
  const downloadConverted = async () => {
    if (playing?.kind !== "converted") return;
    const item = items.find((entry) => entry.id === current);
    const blob = await (await fetch(playing.src)).blob();
    save(blob, `${(item?.name ?? "video").replace(/\.[^.]+$/, "")}.${blob.type === "video/webm" ? "webm" : "mp4"}`);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDrag(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
    else addLink(event.dataTransfer.getData("text/uri-list") || event.dataTransfer.getData("text/plain"));
  };

  const tool = "grid size-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-35";
  return (
    <div className="ve-root flex size-full min-h-0 flex-col bg-[#07080c] text-white" onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
      <div className="flex shrink-0 items-center gap-1.5 border-b border-white/[.07] px-2.5 py-2">
        <button type="button" onClick={() => fileInput.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-medium hover:bg-white/15"><FilePlus2 className="size-3.5" />Open file</button>
        <form className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-white/[.06] px-2.5" onSubmit={(event) => { event.preventDefault(); addLink(link); }}>
          <Link2 className="size-3.5 shrink-0 text-white/45" />
          <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Paste a video link (mp4, webm, mkv, m3u8...)" aria-label="Video link" className="h-8 min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-white/35" />
        </form>
        <button type="button" title="Subtitles (.srt or .vtt)" aria-label="Subtitles" onClick={() => subInput.current?.click()} disabled={!playing} className={tool}><Captions className="size-4" /></button>
        <button type="button" title={`Speed ${speed}x`} aria-label="Playback speed" onClick={() => setSpeed((value) => [0.5, 0.75, 1, 1.25, 1.5, 2][([0.5, 0.75, 1, 1.25, 1.5, 2].indexOf(value) + 1) % 6]!)} className={`${tool} w-auto px-2 text-[11px] font-semibold tabular-nums`}><Gauge className="mr-1 size-3.5" />{speed}x</button>
        <button type="button" title="Loop" aria-label="Loop" aria-pressed={loop} onClick={() => setLoop((value) => !value)} className={`${tool} ${loop ? "bg-white/15 text-white" : ""}`}><Repeat className="size-4" /></button>
        <button type="button" title="Picture in picture" aria-label="Picture in picture" disabled={!playing} onClick={() => void video.current?.requestPictureInPicture?.().catch(() => undefined)} className={tool}><PictureInPicture2 className="size-4" /></button>
        <button type="button" title="Save this frame" aria-label="Save this frame" disabled={!playing} onClick={snapshot} className={tool}><Camera className="size-4" /></button>
        <button type="button" title="Save the converted video" aria-label="Save the converted video" disabled={playing?.kind !== "converted"} onClick={() => void downloadConverted()} className={tool}><Download className="size-4" /></button>
        <button type="button" title="Playlist" aria-label="Playlist" aria-pressed={list} onClick={() => setList((value) => !value)} className={`${tool} ${list ? "bg-white/15 text-white" : ""}`}><ListVideo className="size-4" /></button>
        <input ref={fileInput} type="file" multiple accept="video/*,audio/*,.mkv,.avi,.wmv,.flv,.mov,.mpg,.mpeg,.ts,.m2ts,.3gp,.vob,.srt,.vtt" hidden onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
        <input ref={subInput} type="file" accept=".srt,.vtt" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadSubs(file); event.target.value = ""; }} />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 items-center justify-center bg-black">
          {playing && (
            <video key={playing.src} ref={video} src={playing.kind === "hls" ? undefined : playing.src} controls autoPlay loop={loop} playsInline onError={() => playing.kind !== "hls" && setError("This video can't be played here. Try opening the file so the engine can convert it.")} className="size-full object-contain">
              {subs && <track kind="subtitles" src={subs} label="Subtitles" default />}
            </video>
          )}
          {!playing && !busy && (
            <div className="max-w-md px-6 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[#6352ff] to-[#1e2a78] shadow-[0_0_60px_#6352ff55]"><ListVideo className="size-8" /></div>
              <h2 className="mt-4 text-[20px] font-semibold">Video Engine</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-white/60">Drop a video here, open a file or paste a link. MKV, AVI, WMV, FLV, MOV and other formats are converted right in your browser, and .m3u8 streams play live.</p>
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-black/70">
              <div className="w-72 text-center">
                <Loader2 className="mx-auto size-8 animate-spin text-[#8b80ff]" />
                <p className="mt-3 text-[13px]">{busy.label}</p>
                {busy.progress !== null && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#8b80ff] transition-[width]" style={{ width: `${Math.round(busy.progress * 100)}%` }} /></div>}
                {busy.progress !== null && <p className="mt-1.5 text-[11px] tabular-nums text-white/50">{Math.round(busy.progress * 100)}%</p>}
              </div>
            </div>
          )}
          {error && (
            <div role="alert" className="absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-950/85 px-3 py-2 text-[12px]">
              <span className="flex-1">{error}</span>
              <button type="button" aria-label="Dismiss" onClick={() => setError("")} className="text-white/60 hover:text-white"><X className="size-3.5" /></button>
            </div>
          )}
          {drag && <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-2xl border-2 border-dashed border-[#8b80ff] bg-[#6352ff]/15 text-[14px] font-medium">Drop to play</div>}
          {playing?.note && <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10.5px] text-white/75">{playing.note}</span>}
        </div>
        {list && items.length > 0 && (
          <aside className="w-56 shrink-0 overflow-auto border-l border-white/[.07] bg-[#0b0c12] p-2">
            <p className="px-1.5 pb-1.5 pt-1 text-[10.5px] font-semibold uppercase tracking-wider text-white/40">Playlist</p>
            {items.map((item) => (
              <div key={item.id} className={`group flex items-center gap-1 rounded-lg ${item.id === current ? "bg-white/10" : "hover:bg-white/[.06]"}`}>
                <button type="button" onClick={() => void open(item)} className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-[12px]" title={item.name}>{item.name}</button>
                <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setItems((value) => value.filter((entry) => entry.id !== item.id))} className="mr-1 hidden size-5 place-items-center rounded text-white/50 hover:text-white group-hover:grid"><X className="size-3" /></button>
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}

// Checks quickly whether this browser can decode a file before showing it.
function playable(url: string) {
  return new Promise<boolean>((resolve) => {
    const probe = document.createElement("video");
    probe.muted = true;
    probe.preload = "metadata";
    const done = (ok: boolean) => {
      window.clearTimeout(timer);
      probe.removeAttribute("src");
      probe.load();
      resolve(ok);
    };
    const timer = window.setTimeout(() => done(false), 8000);
    probe.onloadedmetadata = () => done(probe.videoWidth > 0 || probe.duration > 0);
    probe.onerror = () => done(false);
    probe.src = url;
  });
}

// The proxy engine encodes addresses as <prefix><encoded url>. Knowing the prefix from one encoded link,
// any address can be encoded right away, which hls.js needs for every playlist and segment it loads.
async function proxyRewriter(proxyUrl: (url: string) => Promise<string>, sample: string) {
  const encoded = await proxyUrl(sample);
  const index = encoded.indexOf(encodeURIComponent(sample));
  if (index < 0) return null;
  const prefix = encoded.slice(0, index);
  return (url: string) => prefix + encodeURIComponent(url);
}
