document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("adminLoginForm");

    const errorBox =
        document.getElementById("adminLoginError");

    const button =
        document.getElementById("adminLoginButton");

    const buttonText =
        document.getElementById("loginButtonText");


    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        errorBox.hidden = true;


        const identifier =
            document
                .getElementById("identifier")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        // ==============================
        // VALIDATION
        // ==============================

        if (!identifier || !password) {

            errorBox.textContent =
                "Email/Phone Number and Password are required.";

            errorBox.hidden = false;

            return;
        }


        // ==============================
        // LOADING STATE
        // ==============================

        button.disabled = true;

        buttonText.textContent =
            "Signing in...";


        try {

            // ==============================
            // ADMIN LOGIN API
            // ==============================

            const response =
                await fetch("/auth/admin-login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        identifier,

                        password

                    })

                });


            const data =
                await response.json();


            // ==============================
            // LOGIN FAILED
            // ==============================

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Admin login failed."
                );

            }


            // ==============================
            // LOGIN SUCCESS
            // ==============================

            window.location.href =
                "/admin/dashboard";


        } catch (error) {

            console.error(
                "ADMIN LOGIN ERROR:",
                error
            );


            errorBox.textContent =
                error.message ||
                "Admin login failed.";


            errorBox.hidden = false;


            // ==============================
            // RESTORE BUTTON
            // ==============================

            button.disabled = false;

            buttonText.textContent =
                "Admin Login";

        }

    });

});