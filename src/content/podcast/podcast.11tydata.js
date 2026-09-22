module.exports = {
  tags: ["podcast"],
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => `/podcast/${data.page.fileSlug}/`,
  },
};
