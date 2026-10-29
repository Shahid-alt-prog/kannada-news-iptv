import test from "node:test";
import assert from "node:assert/strict";
import { bestFormat, makePlaylist } from "../src/playlist.js";

test("playlist contains valid M3U header and skips unavailable channels", () => {
  const result = makePlaylist([{ name: "TV9 Kannada", url: "https://example.test/live.m3u8" }, { name: "Offline", url: null }], new Date("2026-01-01T00:00:00Z"));
  assert.match(result, /^#EXTM3U/);
  assert.match(result, /TV9 Kannada/);
  assert.doesNotMatch(result, /Offline/);
});

test("selects highest-resolution HLS video format, not audio-only", () => {
  const selected = bestFormat([{ protocol: "m3u8", vcodec: "none", height: 0 }, { protocol: "m3u8_native", vcodec: "avc1", height: 720, tbr: 2200 }, { protocol: "m3u8", vcodec: "avc1", height: 1080, tbr: 4500 }]);
  assert.equal(selected.height, 1080);
});
