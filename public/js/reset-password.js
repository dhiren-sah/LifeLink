document.addEventListener("DOMContentLoaded", () => {

    const resetPasswordForm =
        document.getElementById("resetPasswordForm");

    const params =
        new URLSearchParams(window.location.search);

    const token = params.get("token");


    // Check reset token
    if (!token) {

        alert("Invalid or missing password reset link.");

        window.location.href = "/forgot-password";

        return;
    }


    resetPasswordForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const newPassword =
            document.getElementById("newPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const button =
            resetPasswordForm.querySelector("button");


        // Check passwords
        if (newPassword !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }


        // Minimum password length
        if (newPassword.length < 8) {

            alert(
                "Password must be at least 8 characters long."
            );

            return;
        }


        button.disabled = true;
        button.textContent = "Resetting...";


        try {

            const response = await fetch(
                "/auth/reset-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        token: token,
                        password: newPassword
                    })
                }
            );


            const data = await response.json();


            if (!response.ok || !data.success) {

                alert(
                    data.message ||
                    "Unable to reset password."
                );

                return;
            }


            alert(
                "Password reset successful. You can now login with your new password."
            );


            window.location.href = "/login";


        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );

            alert(
                "Unable to connect to the server. Please try again."
            );

        } finally {

            button.disabled = false;
            button.textContent = "Reset Password";
        }

    });

});