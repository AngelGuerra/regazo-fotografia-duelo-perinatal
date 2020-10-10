const htmlmin = require("html-minifier");
const Image = require("@11ty/eleventy-img");

module.exports = (eleventyConfig) => {
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addWatchTarget("./_tmp/style.css");

  eleventyConfig.addPassthroughCopy({
    "./_tmp/style.css": "./style.css",
    "./node_modules/alpinejs/dist/alpine.js": "./alpine.js",
    "./favicon": ".",
  });

  eleventyConfig.addShortcode("version", () => {
    return String(Date.now());
  });

  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveBackground",
    async function (src, selector, outputFormat = "jpeg") {
      if (selector === undefined) {
        throw new Error(
          `Missing \`selector\` on responsiveBackground from: ${src}`
        );
      }

      let stats = await Image(src, {
        widths: [640, 768, 1024, 1280, 1920],
        formats: [outputFormat],
        outputDir: "./_site/img/",
      });
      let lowestSrc = stats[outputFormat][0];

      return `<style>
      html ${selector} {
        background-image: url("${lowestSrc.url}");
      }

      ${Object.values(stats)
        .map((imageFormat) => {
          return imageFormat.map(
            (entry) =>
              `@media screen and (min-width: ${entry.width}px) {
                background-image: url("${entry.url}");
              }`
          );
        })
        .join("\n")}
      </style>`;
    }
  );

  eleventyConfig.addTransform("htmlmin", (content, outputPath) => {
    if (
      process.env.ELEVENTY_PRODUCTION &&
      outputPath &&
      outputPath.endsWith(".html")
    ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });

      return minified;
    }

    return content;
  });
};
