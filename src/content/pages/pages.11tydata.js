module.exports = {
  tags: ["page"],
  layout: "page.njk",
  eleventyComputed: {
    permalink: (data) => `/${data.page.fileSlug}/`,
  },
};
