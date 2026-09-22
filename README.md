# James Christensen LMFT

A simple copy of [jamesmchristensen.com](https://jamesmchristensen.com): homepage, blog, podcast, videos, a contact form, and an email list. Plain files. No app framework.

## Edit

| What | Where |
| --- | --- |
| Homepage words, videos, and issue cards | `src/_data/home.js` |
| Phone, address, menu, booking link | `src/_data/site.js` |
| New blog post | `src/content/blog/my-post.md` |
| New podcast episode | `src/content/podcast/my-episode.md` |
| New page | `src/content/pages/my-page.md` |
| Look of the site | `src/css/site.css` |

A post is a Markdown file:

```md
---
title: "The title"
description: "One sentence for Google."
pubDate: 2026-09-22
excerpt: "The first lines, shown on the blog index."
---

The article.
```

A podcast episode uses the same shape, plus `audioUrl` and a YouTube embed if you have one. Put an MP3 in `public/audio/` and set `audioUrl: "/audio/my-episode.mp3"`. Until that file exists, the player uses the current Squarespace audio file for episodes that are already on the air.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes the site to `_site`.

## Cloudflare Pages

Connect this repo. Build command `npm run build`. Output directory `_site`. Node 22.

Then set one environment variable:

- `FORMSPREE_URL` — where the contact form and the email list are delivered, for example `https://formspree.io/f/xxxxxx`

The email list can use a different address with `SUBSCRIBE_WEBHOOK_URL`. Until one of those is set, the forms say so and ask people to call 916-292-8920.

Podcast apps can keep using `/podcast?format=rss`. The blog feed is `/blog?format=rss`.
