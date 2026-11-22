const navigation = document.querySelector(".navigation");
const navToggle = document.querySelector(".nav-toggle");

if (navigation && navToggle) {
    const closeNavigation = () => {
        navigation.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
    };

    navToggle.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navigation.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 760) {
            closeNavigation();
        }
    });
}
