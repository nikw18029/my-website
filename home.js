let firstname = localStorage.getItem("firstname");
let lastname = localStorage.getItem("lastname");
let welcomeMessage = document.getElementById("welcome");

if (firstname && lastname) {
    welcomeMessage.textContent = `Welcome, ${firstname} ${lastname}!`;
} else {
    welcomeMessage.textContent = "Welcome to the Home Page!";
}
