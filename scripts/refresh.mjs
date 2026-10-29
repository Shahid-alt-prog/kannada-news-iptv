import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bestFormat, makePlaylist } from "../src/playlist.js";

const channels = [
  ["News18 Kannada", "youtube", "https://www.youtube.com/live/cbspYdPHsNQ"],
  ["TV9 Kannada", "youtube", "https://www.youtube.com/live/jdJoOhqCipA"],
  ["News First Kannada", "youtube", "https://www.youtube.com/live/J9RbDvjS-FU"],
  ["Republic Kannada", "youtube", "https://www.youtube.com/live/z1GOsQrHH9A"],
  ["Zee Kannada News", "youtube", "https://www.youtube.com/live/Idf6-_XxKJ4"],
  ["Power TV", "direct", "https://powertvkannada.com/hls/1/stream.m3u8"],
  ["Suvarna News", "youtube", "https://www.youtube.com/live/F1m0ciwMs8c"],
  ["TV5 Kannada", "youtube", "https://www.youtube.com/live/WV2uIrHGoZ4"],
  ["Vistara News", "youtube", "https://www.youtube.com/live/4U6qvea2E7o"],
];

let cookieFile = process.env.YOUTUBE_COOKIES_PATH || null;
let tempCookiePath = null;

if (process.env.YOUTUBE_COOKIES) {
  tempCookiePath = join(tmpdir(), `yt_cookies_${Date.now()}.txt`);
  writeFileSync(tempCookiePath, process.env.YOUTUBE_COOKIES, "utf8");
  cookieFile = tempCookiePath;
} else if (!cookieFile) {
  if (existsSync("cookies.txt")) {
    cookieFile = "cookies.txt";
  } else if (existsSync("C:\\cookies.txt")) {
    cookieFile = "C:\\cookies.txt";
  }
}

try {
  const results = await Promise.all(channels.map(async ([name, type, source]) => {
    try {
      if (type === "direct") return { name, url: source, height: null };
      const ytdlpArgs = [
        "--no-warnings",
        "--skip-download",
        "-J",
        "--extractor-args",
        "youtube:player-client=ios,web",
      ];
      if (cookieFile && existsSync(cookieFile)) {
        ytdlpArgs.push("--cookies", cookieFile);
      }
      ytdlpArgs.push(source);
      const raw = execFileSync("yt-dlp", ytdlpArgs, { encoding: "utf8", timeout: 90000, maxBuffer: 20 * 1024 * 1024 });
      const info = JSON.parse(raw);
      if (!info.is_live && info.live_status !== "is_live") throw new Error("channel is not live");
      const format = bestFormat(info.formats || []);
      if (!format?.url) throw new Error("no HLS video format available");
      return { name, url: format.url, height: format.height };
    } catch (error) {
      console.warn(`${name}: ${error.message}`);
      return { name, url: null };
    }
  }));

  await mkdir("public", { recursive: true });
  await writeFile("public/kannada-news.m3u", makePlaylist(results));
  await writeFile("public/status.json", JSON.stringify({ updatedAt: new Date().toISOString(), channels: results.map(({ name, url, height }) => ({ name, available: Boolean(url), height: height || null })) }, null, 2) + "\n");
  console.log(`Wrote playlist with ${results.filter((c) => c.url).length} live channels.`);
} finally {
  if (tempCookiePath && existsSync(tempCookiePath)) {
    try { rmSync(tempCookiePath); } catch {}
  }
}
