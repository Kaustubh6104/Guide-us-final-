// Function to generate trip itinerary
function generateItinerary() {
    let destination = document.getElementById("destination").value;
    let startDate = document.getElementById("start-date").value;
    let endDate = document.getElementById("end-date").value;
    let accommodation = document.getElementById("accommodation").value;
    let activities = Array.from(document.getElementById("activities").selectedOptions).map(option => option.value);

    if (destination === "" || startDate === "" || endDate === "") {
        alert("Please fill all fields!");
        return;
    }

    let itineraryContent = `
        <h3>Trip Itinerary</h3>
        <p><strong>Destination:</strong> ${destination}</p>
        <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Accommodation:</strong> ${accommodation}</p>
        <p><strong>Activities:</strong> ${activities.join(", ")}</p>
    `;

    document.getElementById("itinerary-preview").innerHTML = itineraryContent;
}

// Function to save trip (Simulated for now)
function saveTrip() {
    alert("Trip saved successfully!");
}
// Restrict date picker to allow only future dates up to 2 years
document.addEventListener("DOMContentLoaded", function () {
    let today = new Date();
    let maxDate = new Date();
    maxDate.setFullMonth(today.getFullMonth() + 2); // Set max date to 2 years ahead

    let formattedToday = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    let formattedMaxDate = maxDate.toISOString().split("T")[0];

    document.getElementById("start-date").setAttribute("min", formattedToday);
    document.getElementById("end-date").setAttribute("min", formattedToday);
    document.getElementById("start-date").setAttribute("max", formattedMaxDate);
    document.getElementById("end-date").setAttribute("max", formattedMaxDate);
});
