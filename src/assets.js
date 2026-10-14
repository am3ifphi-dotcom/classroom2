// A single-file release provides the same assets as data URLs, without a server.
export function assetURL(path){return globalThis.__INLINE_ASSETS__?.[path]||path;}
