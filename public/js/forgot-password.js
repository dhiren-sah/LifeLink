const forgotPasswordForm = document.getElementById("forgotPasswordForm");

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const button = forgotPasswordForm.querySelector("button");

    button.disabled = true;
    button.textContent = "Sending...";

    try {
        const response = await fetch("/auth/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        alert(data.message);

    } catch (error) {
        console.error(error);
        alert("Something went wrong. Please try again.");
    } finally {
        button.disabled = false;
        button.textContent = "Send Reset Link";
    }
});
