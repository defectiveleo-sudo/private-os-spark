// PRIVATE OS proxy transport for Scramjet 2: Epoxy and libcurl spread over several Wisp servers.
// Public Wisp servers each block some sites, and any of them can drop a connection mid-handshake.
// A request that fails on one server is sent again through the next one, and the server that
// worked is remembered for that site.
// YouTube and Google's video servers reject Epoxy's HTTP/2 connections (PROTOCOL_ERROR), so those
// hosts go through libcurl (HTTP/1.1), which is only downloaded the first time one of them is opened.
import EpoxyTransport from "/epoxy.mjs";

const HTTP1_HOSTS = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|googlevideo\.com|ytimg\.com|ggpht\.com|youtubei\.googleapis\.com)$/i;
let curlModule = null;
const loadCurl = () => (curlModule ??= import("/curl.mjs").then((module) => module.default));

export default class RelayTransport {
  ready = false;

  constructor(options) {
    const list = Array.isArray(options?.servers) ? options.servers : [options?.wisp];
    this.servers = [...new Set(list.filter((url) => typeof url === "string" && /^wss?:\/\/.+\/$/.test(url)))];
    this.lanes = this.servers.map((wisp) => ({ wisp, epoxy: null, curl: null }));
    this.siteLane = new Map();
  }

  async init() {
    if (this.lanes.length === 0) throw new Error("No proxy server configured");
    await this.lane(0, "epoxy");
    this.ready = true;
  }

  async meta() {}

  // A lane's transports start the first time a site needs them.
  async lane(index, kind) {
    const lane = this.lanes[index];
    if (!lane[kind]) {
      lane[kind] = (async () => {
        const Transport = kind === "curl" ? await loadCurl() : EpoxyTransport;
        const transport = kind === "curl" ? new Transport({ wisp: lane.wisp, websocket: lane.wisp }) : new Transport({ wisp: lane.wisp });
        await transport.init();
        return transport;
      })();
      lane[kind].catch(() => {
        lane[kind] = null;
      });
    }
    return lane[kind];
  }

  order(host) {
    const first = this.siteLane.get(host) ?? 0;
    return this.lanes.map((_, step) => (first + step) % this.lanes.length);
  }

  async request(remote, method, body, headers, signal) {
    if (body instanceof Blob) body = await body.arrayBuffer();
    const host = remote.hostname;
    const kind = HTTP1_HOSTS.test(host) ? "curl" : "epoxy";
    // A YouTube player opened straight from its embed address has no page around it, and YouTube
    // refuses to configure a player without a referrer.
    if (kind === "curl" && remote.pathname.startsWith("/embed/")) {
      const list = Array.isArray(headers) ? headers : Object.entries(headers || {});
      if (!list.some(([key]) => key.toLowerCase() === "referer")) list.push(["referer", "https://www.youtube.com/"]);
      headers = list;
    }
    let failure;
    for (const index of this.order(host)) {
      try {
        const response = await (await this.lane(index, kind)).request(remote, method, body, headers, signal);
        this.siteLane.set(host, index);
        return response;
      } catch (error) {
        failure = error;
        if (signal?.aborted || body instanceof ReadableStream) break;
      }
    }
    throw failure;
  }

  connect(url, protocols, requestHeaders, onopen, onmessage, onclose, onerror) {
    const [index] = this.order(url.hostname);
    const socket = this.lane(index, "epoxy").then((transport) => transport.connect(url, protocols, requestHeaders, onopen, onmessage, onclose, onerror));
    socket.catch((error) => onerror(String(error)));
    return [
      async (data) => (await socket)[0](data),
      async (code, reason) => (await socket)[1](code, reason),
    ];
  }
}
