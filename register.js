document.getElementById("register-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // stop page refresh

    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstname,
                lastname,
                username,
                email,
                password
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful ✅");
            window.location.href = "/login"; // redirect after success
        } else {
            alert(result.error || "Registration failed ❌");
        }

    } catch (err) {
        console.error("Request failed:", err);
        alert("Server error. Try again later.");
    }
});