export function makePlaylist(channels, generatedAt = new Date()) {
  const entries = channels
    .filter((channel) => channel.url)
    .map((channel) => `#EXTINF:-1 tvg-name="${channel.name}" group-title="Kannada News",${channel.name}\n${channel.url}`);
  return `#EXTM3U\n# Updated: ${generatedAt.toISOString()}\n${entries.join("\n")}\n`;
}

export function bestFormat(formats) {
  return formats
    .filter((f) => f.protocol?.includes("m3u8") && f.vcodec !== "none" && Number(f.height) > 0)
    .sort((a, b) => Number(b.height) - Number(a.height) || Number(b.tbr || 0) - Number(a.tbr || 0))[0];
}
