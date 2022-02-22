module.exports = {
  mode: "jit",
  content: ["./_site/**/*.html", "./_site/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        title: [
          "Indie Flower",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
