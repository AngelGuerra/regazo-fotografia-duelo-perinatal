import Alpine from "alpinejs";

import nav from "./modules/nav";

document.addEventListener("alpine:initializing", () => {
  Alpine.data("nav", nav);
});

Alpine.start();
