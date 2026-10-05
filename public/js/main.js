

// =========================================================
// BLOOD BANK MANAGEMENT SYSTEM
// HOME PAGE JAVASCRIPT
// =========================================================


document.addEventListener("DOMContentLoaded", () => {


    // =====================================================
    // MOBILE NAVIGATION
    // =====================================================

    const menuToggle =
        document.getElementById("menuToggle");

    const navMenu =
        document.getElementById("navMenu");


    // Agar elements current page par nahi hain
    // to JS safely stop ho jayega.

    if (!menuToggle || !navMenu) {
        return;
    }


    // =====================================================
    // OPEN / CLOSE MOBILE MENU
    // =====================================================

    menuToggle.addEventListener("click", () => {

        const isOpen =
            navMenu.classList.toggle("active");


        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );


        menuToggle.textContent =
            isOpen ? "✕" : "☰";

    });


    // =====================================================
    // CLOSE MENU AFTER LINK CLICK
    // =====================================================

    const navLinks =
        navMenu.querySelectorAll("a");


    navLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            menuToggle.textContent =
                "☰";

        });

    });


    // =====================================================
    // CLOSE MENU ON RESIZE
    // =====================================================

    window.addEventListener("resize", () => {

        if (window.innerWidth > 900) {

            navMenu.classList.remove("active");


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            menuToggle.textContent =
                "☰";

        }

    });


    // =====================================================
    // HEADER SEARCH
    // =====================================================

    const headerSearch =
        document.getElementById("headerSearch");


    if (headerSearch) {

        headerSearch.addEventListener(
            "keydown",
            (event) => {

                if (event.key !== "Enter") {
                    return;
                }


                const searchValue =
                    headerSearch.value.trim();


                if (!searchValue) {
                    return;
                }


                // User ko Blood Availability page par
                // search value ke saath bhejenge.

                const url =
                    `/blood-availability?search=${encodeURIComponent(
                        searchValue
                    )}`;


                window.location.href = url;

            }
        );

    }


    // =====================================================
    // CURRENT YEAR
    // =====================================================

    const currentYear =
        document.getElementById("currentYear");


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    // =====================================================
    // ESC KEY
    // MOBILE MENU CLOSE
    // =====================================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            navMenu.classList.remove("active");


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            menuToggle.textContent =
                "☰";

        }
    );

});