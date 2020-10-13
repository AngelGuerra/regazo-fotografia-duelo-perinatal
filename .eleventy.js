const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const generator = require("eleventy-plugin-meta-generator");
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
    async (src, selector, outputFormat = "jpeg") => {
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
      let highestSrc = stats[outputFormat][4];

      return new CleanCSS({}).minify(`
      html ${selector} { background-image: url("${highestSrc.url}"); }
      ${Object.values(stats)
        .map((imageFormat) => {
          return imageFormat
            .reverse()
            .map(
              (entry) =>
                `@media screen and (max-width: ${entry.width}px) {
                  html ${selector} {
                    background-image: url("${entry.url}");
                  }
                }`
            )
            .join("\n");
        })
        .join("\n")}
      `).styles;
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

  eleventyConfig.addNunjucksTag("generator", (nunjucksEngine) => {
    return new (function () {
      this.tags = ["generator"];

      this.parse = function (parser, nodes, lexer) {
        var tok = parser.nextToken();

        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        return new nodes.CallExtensionAsync(this, "run", args);
      };

      this.run = function (_, myStringArg, callback) {
        generator().then((metaTag) => {
          let ret = new nunjucksEngine.runtime.SafeString(metaTag);
          callback(null, ret);
        });
      };
    })();
  });
};
