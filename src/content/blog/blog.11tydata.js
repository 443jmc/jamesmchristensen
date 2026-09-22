module.exports = {
  tags: ["blog"],
  layout: "post.njk",
  eleventyComputed: {
    permalink: (data) => `/blog/${data.page.fileSlug}/`,
  },
};
