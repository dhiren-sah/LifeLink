const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("/auth/login", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                identifier,
                password
            })
        });

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            localStorage.setItem("bbmsUserId", data.user._id);
            window.location.href = "/dashboard";

        }

    } catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }

});
