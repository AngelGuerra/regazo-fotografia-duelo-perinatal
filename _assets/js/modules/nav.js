const nav = () => {
  return {
    isOpen: false,

    toggleMenu() {
      this.isOpen = !this.isOpen;
    },

    closeMenu() {
      this.isOpen = false;
    },

    scrollTo(event) {
      event.preventDefault();

      const offsetTop = document.querySelector(
        event.currentTarget.getAttribute("href")
      ).offsetTop;

      scroll({ top: offsetTop });
    },

    scrollToAndCloseMenu(event) {
      this.closeMenu();
      this.scrollTo(event);
    },
  };
};

export default nav;
