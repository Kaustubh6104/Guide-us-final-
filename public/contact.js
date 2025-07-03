// Contact Form Submission
document.getElementById("contact-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent page reload

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let message = document.getElementById("message").value.trim();

    if (name === "" || email === "" || subject === "" || message === "") {
        alert("Please fill out all fields!");
        return;
    }

    // Simulated form submission (Replace with backend API integration)
    alert(`Thank you, ${name}! Your message has been sent.`);
    document.getElementById("contact-form").reset();
});
