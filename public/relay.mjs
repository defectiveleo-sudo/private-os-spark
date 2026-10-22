// PRIVATE OS proxy transport: Epoxy spread over several Wisp servers.
// Public Wisp servers each block some sites (one refuses TikTok and Instagram, for example), and any
// of them can drop a connection mid-handshake. A request that fails on one server is sent again
// through the next one, and the server that worked is remembered for that site.
import EpoxyTransport from "/epoxy.mjs";

export default class RelayTransport {
  ready = false;

  constructor(options) {
    const list = Array.isArray(options?.servers) ? options.servers : [options?.wisp];
    this.servers = [...new Set(list.filter((url) => typeof url === "string" && /^wss?:\/\/.+\/$/.test(url)))];
    this.lanes = this.servers.map((wisp) => ({ transport: new EpoxyTransport({ wisp }), starting: null }));
    this.siteLane = new Map();
  }

  async init() {
    if (this.lanes.length === 0) throw new Error("No proxy server configured");
    await this.lane(0);
    this.ready = true;
  }

  async meta() {}

  // Servers after the first start the first time a site needs them.
  async lane(index) {
    const lane = this.lanes[index];
    if (!lane.transport.ready) {
      lane.starting ??= lane.transport.init();
      await lane.starting;
    }
    return lane.transport;
  }

  order(host) {
    const first = this.siteLane.get(host) ?? 0;
    return this.lanes.map((_, step) => (first + step) % this.lanes.length);
  }

  async request(remote, method, body, headers, signal) {
    if (body instanceof Blob) body = await body.arrayBuffer();
    const host = remote.hostname;
    let failure;
    for (const index of this.order(host)) {
      try {
        const response = await (await this.lane(index)).request(remote, method, body, headers, signal);
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
    const socket = this.lane(index).then((transport) => transport.connect(url, protocols, requestHeaders, onopen, onmessage, onclose, onerror));
    socket.catch((error) => onerror(String(error)));
    return [
      async (data) => (await socket)[0](data),
      async (code, reason) => (await socket)[1](code, reason),
    ];
  }
}
