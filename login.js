document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const result = await response.json();
        console.log(result);

        if (response.ok) {
            localStorage.setItem("firstname", result.firstname);
            localStorage.setItem("lastname", result.lastname);
            localStorage.setItem("username", result.username);
            alert("Login successful ✅");
            window.location.href = "/home";
        } else {
            alert(result.error || "Login failed ❌");
        }

    } catch (err) {
        console.error("Request failed:", err);
        alert("Server error. Try again later.");
    }
});