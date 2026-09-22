module.exports = {
  tags: ["summaries"],
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => `/book-summaries/${data.page.fileSlug}/`,
  },
};
