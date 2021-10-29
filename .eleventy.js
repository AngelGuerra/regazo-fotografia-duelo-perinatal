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
 * @description Genera una imagen para su uso, por ejemplo, en los microdatos.
 * @param {String} src Ruta original de la imagen.
 * @param {Number} quality Calidad de la imagen generada.
 * @param {Number} width Ancho de la imagen generada.
 * @param {String} format Formato de salida de la imagen generada.
 * @returns {String} URL de la imagen.
 */
const metaImg = async (src, quality = 95, width = 1200, format = "webp") => {
  const metadata = await Image(src, {
    widths: [width],
    formats: [format],
    outputDir: `./_site/assets/img/meta`,
    urlPath: `/assets/img/meta`,
    sharpWebpOptions: {
      quality: quality,
    },
  });

  return absoluteUrl(metadata[format][0].url);
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
 * @description Create the tag "generator" to use in the page metas.
 * @returns {Function}
 */
const generatorTag = () => {
  return {
    render: () => generator(),
  };
};

/**
 * @description Returs domain.
 * @param {String} url Relative URL.
 * @returns {String}
 */
const domain = (withSlash = true) =>
  `${
    process.env.ELEVENTY_PRODUCTION
      ? "https://dueloperinatal.regazofotografia.com"
      : "http://localhost:8080"
  }${withSlash ? "/" : ""}`;

/**
 * @description Returns the absolute URL for a relative URL.
 * @param {String} url Relative URL.
 * @returns {String}
 */
const absoluteUrl = (url) => {
  const base = domain(false);

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
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addLayoutAlias("default", "layouts/default.html");
  eleventyConfig.setTemplateFormats(["html"]);
  eleventyConfig.addPassthroughCopy({
    "_assets/css/": "./assets/css/",
    "_assets/favicon": "/",
    "_tmp/js/": "./assets/js/",
    favicon: ".",
  });
  eleventyConfig.addTransform("htmlmin", minifyHtml);
  eleventyConfig.addShortcode("version", currentDate);
  eleventyConfig.addShortcode("externalLink", externalLink);
  eleventyConfig.addShortcode("metaImg", metaImg);
  eleventyConfig.addShortcode("domain", domain);
  eleventyConfig.addAsyncShortcode(
    "responsiveBackground",
    responsiveBackground
  );
  eleventyConfig.addLiquidTag("generator", generatorTag);
};
