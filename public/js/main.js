// ============================
// HOME PAGE MOBILE NAVIGATION
// ============================

document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    // Agar current page par menu nahi hai
    // to JS error nahi dega.
    if (!menuToggle || !navMenu) {
        return;
    }


    // ============================
    // Toggle Menu
    // ============================

    menuToggle.addEventListener("click", () => {

        const isOpen = navMenu.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        // Hamburger ↔ Close icon
        menuToggle.textContent = isOpen ? "✕" : "☰";

    });


    // ============================
    // Close Menu After Link Click
    // ============================

    const navLinks = navMenu.querySelectorAll("a");

    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.textContent = "☰";

        });

    });


    // ============================
    // Close Menu On Resize
    // ============================

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            navMenu.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.textContent = "☰";

        }

    });

});