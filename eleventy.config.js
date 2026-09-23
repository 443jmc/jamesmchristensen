const fs = require("fs");
const path = require("path");

const enclosures = JSON.parse(
  fs.readFileSync(path.join(__dirname, "src/_data/enclosures.json"), "utf8")
);

function enclosureFor(audioUrl) {
  if (!audioUrl) return null;
  const file = String(audioUrl).split("/").pop();
  const slug = file.replace(/\.(mp3|mp4|m4a)$/i, "");
  const localPath = path.join(__dirname, "public/audio", file);
  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
    const type = /\.mp4$/i.test(file) ? "video/mp4" : "audio/mpeg";
    return { url: "/audio/" + file, length: String(fs.statSync(localPath).size), type, local: true };
  }
  if (enclosures[slug]) return enclosures[slug];
  if (String(audioUrl).startsWith("http")) {
    return { url: audioUrl, length: "0", type: "audio/mpeg" };
  }
  return null;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ public: "." });

  eleventyConfig.addFilter("prettyDate", (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    }).format(date);
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  });

  eleventyConfig.addFilter("rfc822", (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toUTCString();
  });

  eleventyConfig.addFilter("xml", (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  );

  eleventyConfig.addFilter("sortByDate", (items) => {
    return [...items].sort((a, b) => {
      const ad = new Date(a.data.pubDate || 0).getTime() || 0;
      const bd = new Date(b.data.pubDate || 0).getTime() || 0;
      return bd - ad;
    });
  });

  eleventyConfig.addFilter("enclosure", (audioUrl) => enclosureFor(audioUrl));

  eleventyConfig.addFilter("canonical", (url, siteUrl) => {
    const origin = String(siteUrl || "").replace(/\/$/, "");
    if (!url || url === "/") return origin;
    return origin + String(url).replace(/\/$/, "");
  });

  eleventyConfig.addTransform("rewriteAudio", function (content) {
    const outputPath = this.page && this.page.outputPath;
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    return content.replace(/(href|src)="(\/audio\/[^"]+)"/g, (full, attr, audioUrl) => {
      const enc = enclosureFor(audioUrl);
      if (!enc || enc.local) return full;
      return attr + '="' + enc.url.replace(/"/g, "%22") + '"';
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
};
