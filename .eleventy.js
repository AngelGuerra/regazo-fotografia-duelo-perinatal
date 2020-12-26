const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const generator = require("eleventy-plugin-meta-generator");
const Image = require("@11ty/eleventy-img");
const { URL } = require("url");

/**
 * @description Returs current date as a string.
 * @returns {String}
 */
const currentDate = () => String(Date.now());

/**
 * @description Returns an external link with an indicative icon at the end of
 * the text.
 * @param {String} href Destination URI.
 * @param {String} text Link text.
 * @param {String} title Link title.
 * @param {String} rel Link rel.
 * @param {String} linkClass Link class.
 * @returns {String}
 */
const externalLink = (
  href,
  text,
  title,
  rel = "noopener noreferrer",
  linkClass = "text-blue-700 hover:underline"
) => {
  return `<a class="${linkClass}" href="${href}" title="${title}" ${
    rel ? `rel="${rel}"` : ""
  } target="_blank"
  >${text}
  <svg
    class="w-4 h-4 inline"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    ></path>
  </svg>
</a>`;
};

/**
 * @description Generates the necessary minified css to put background images
 * in a responsive way, prepared to paint it inside a <style> tag.
 * @throws {Error} If the selector is not defined.
 * @param {String} src Image path in the project.
 * @param {String} selector CSS selector to which the background image will be
 * applied.
 * @param {String} outputFormat Image output format.
 * @returns {String}
 */
const responsiveBackground = async (src, selector, outputFormat = "jpeg") => {
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
};

/**
 * @description Minifies the html to optimize the page size.
 * @param {String} content Content to minify.
 * @param {String} outputPath Content output path.
 * @returns {String}
 */
const minifyHtml = (content, outputPath) => {
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
};

/**
 * @description Parser for Nunjucks tags.
 * @param {Parser} parser Parser.
 * @param {Object} nodes Nodes.
 * @param {Object} lexer Lexer.
 * @returns {Function}
 */
const parser = function (parser, nodes, lexer) {
  const tok = parser.nextToken();
  const args = parser.parseSignature(null, true);
  parser.advanceAfterBlockEnd(tok.value);

  return new nodes.CallExtensionAsync(this, "run", args);
};

/**
 * @description Create the tag "generator" to use in the page metas.
 * @param {Object} nunjucksEngine Nunjucks engine.
 * @returns {Function}
 */
const generatorTag = (nunjucksEngine) => {
  return new (function () {
    this.tags = ["generator"];
    this.parse = parser;

    this.run = function (_, myStringArg, callback) {
      generator().then((metaTag) => {
        callback(null, new nunjucksEngine.runtime.SafeString(metaTag));
      });
    };
  })();
};

/**
 * @description Returns the absolute URL for a relative URL.
 * @param {String} url Relative URL.
 * @param {String} base Base URL.
 * @returns {String}
 */
const absoluteUrl = (url, base) => {
  try {
    return new URL(url, base).toString();
  } catch (error) {
    console.error(
      "Trying to convert %o to be an absolute url with base %o and failed, returning: %o (invalid url)",
      url,
      base,
      url
    );

    return url;
  }
};

module.exports = (eleventyConfig) => {
  /**
   * @description Returns the value of an attribute of an image. In case of
   * requesting the URL, the absoluteUrl filter is applied.
   * @see absoluteUrl
   * @returns {Function}
   */
  const metaImg = () => {
    return new (function () {
      this.tags = ["metaImg"];
      this.parse = parser;

      /**
       * @description Resizes an image, if it is not resize yet, and returns
       * an attribute.
       * @param {Context} context Context.
       * @param {String} src Path of the image.
       * @param {String} width Image width.
       * @param {String} attr Image attr to extract.
       * @param {Function} callback Callback.
       * @returns {Void}
       */
      this.run = async (context, src, width, attr, callback) => {
        let stats = await Image(src, {
          widths: [width],
          formats: ["jpeg"],
          outputDir: "./_site/img/",
        });

        if (attr !== "url") {
          callback(null, stats["jpeg"][0][attr]);
          return;
        }

        callback(
          null,
          eleventyConfig.getFilter("absoluteUrl")(
            stats["jpeg"][0][attr],
            "https://dueloperinatal.regazofotografia.com/"
          )
        );
      };
    })();
  };

  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addWatchTarget("./_tmp/style.css");
  eleventyConfig.addPassthroughCopy({
    "./_tmp/style.css": "./style.css",
    "./node_modules/alpinejs/dist/alpine.js": "./alpine.js",
    "./favicon": ".",
  });
  eleventyConfig.addTransform("htmlmin", minifyHtml);
  eleventyConfig.addShortcode("version", currentDate);
  eleventyConfig.addNunjucksShortcode("externalLink", externalLink);
  eleventyConfig.addNunjucksAsyncShortcode(
    "responsiveBackground",
    responsiveBackground
  );
  eleventyConfig.addNunjucksTag("generator", generatorTag);
  eleventyConfig.addNunjucksTag("metaImg", metaImg);
  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);
};
