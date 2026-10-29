# Kannada News IPTV playlist

GitHub Actions refreshes the public playlist every 30 minutes by resolving the supplied YouTube live video URLs with `yt-dlp`, selecting the highest-resolution HLS video format, and publishing the generated files to GitHub Pages. Power TV is included from the direct HLS URL supplied by the user.

## Setup

1. Create a GitHub repository and push this folder's contents to its root.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Run **Actions → Refresh IPTV playlist → Run workflow** once. Scheduled runs then publish every 30 minutes.
4. Add `https://YOUR-USER.github.io/YOUR-REPO/kannada-news.m3u` to your IPTV player.

The playlist is generated output and contains short-lived signed YouTube URLs. It refreshes on each successful workflow run; GitHub scheduled runs can be delayed, and channels whose supplied video is no longer live are omitted. YouTube video IDs are fixed links: this job refreshes their signed manifests, but cannot discover a replacement video ID if a channel starts a new live broadcast. Update that channel's source in `scripts/refresh.mjs` when its video ID changes. The Power TV URL is also fixed and must be updated if the provider changes it. This is a public playlist, so anyone with its URL can access its channel entries.

`status.json` reports which channels resolved and their selected resolution. To add or correct a channel, edit `channels` in `scripts/refresh.mjs`.
