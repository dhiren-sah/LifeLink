const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const fullName = document.getElementById("fullname").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const bloodGroup = document.getElementById("bloodGroup").value;

    const response = await fetch("/auth/register", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            fullName,
            phoneNumber,
            email,
            password,
            bloodGroup
        })

    });

    const data = await response.json();

    alert(data.message);

    if (data.success) window.location.href = "/login";

});
