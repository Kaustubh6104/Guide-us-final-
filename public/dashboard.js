// Dummy function for navigation
function navigateTo(page) {
    window.location.href = page;
}

// Function for search action
function searchDestination() {
    let destination = document.getElementById("search-input").value;
    if (destination.trim() !== "") {
        alert("Searching for " + destination);
        // Redirect to a search results page (implement later)
    } else {
        alert("Please enter a destination.");
    }
}

// Simulating user login name (replace with actual login logic)
document.addEventListener("DOMContentLoaded", function() {
    let userName = "John Doe"; // Get from backend in real scenario
    document.getElementById("user-name").innerText = userName;
});
document.addEventListener("DOMContentLoaded", function() {
    let userName = localStorage.getItem("userName") || "Traveler"; 
    document.getElementById("user-name").innerText = userName;
});
