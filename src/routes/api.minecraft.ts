import { createFileRoute } from "@tanstack/react-router";

// Minecraft (Eaglercraft) downloads through this site. The Minecraft app first downloads the game straight
// from the Eaglercraft CDN; when the visitor's network blocks that address (school and work filters often do),
// it asks this route instead, which fetches the same zip and streams it back from this site's own address.
//   ?file=<version>/<name>.zip   one of Eaglercraft's offline downloads, for example 26.3/eaglercraft26-3-6eda6918.zip

const CDNS = ["https://cdn.eaglercraft.net/objects/dl/", "https://cdn.eaglercraft.ru/objects/dl/"];
const FILE = /^\d+(?:\.\d+){1,2}\/eaglercraft[A-Za-z0-9-]{1,40}\.zip$/;

export const Route = createFileRoute("/api/minecraft")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const file = new URL(request.url).searchParams.get("file") ?? "";
        if (!FILE.test(file)) return new Response("Unknown Minecraft download", { status: 400 });
        let last = 502;
        for (const cdn of CDNS) {
          try {
            const response = await fetch(cdn + file, { headers: { "user-agent": "Mozilla/5.0 PRIVATE-OS" }, signal: AbortSignal.timeout(20000) });
            if (response.ok && response.body) {
              const headers = new Headers({ "content-type": "application/zip", "cache-control": "public, max-age=86400" });
              const length = response.headers.get("content-length");
              if (length) headers.set("content-length", length);
              return new Response(response.body, { status: 200, headers });
            }
            last = response.status;
            response.body?.cancel().catch(() => {});
          } catch {
            // try the next CDN
          }
        }
        return new Response("The Minecraft download is not available right now", { status: last === 404 ? 404 : 502 });
      },
    },
  },
});
