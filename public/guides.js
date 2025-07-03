const API_BASE_URL = "http://localhost:4000";

// Load default guides on page load
window.onload = function () {
    loadDefaultGuides(); // You can later rename this to popularGuides
};

// Load some default guides (or remove if not needed)
async function loadDefaultGuides() {
    const container = document.getElementById("popular-guides-list");
    container.innerHTML = "<p>Loading guides...</p>";

    try {
        // Temporarily using search-guides with empty string to load some guides
        const response = await fetch(`${API_BASE_URL}/search-guides?location=`);
        const guides = await response.json();
        displayGuides(guides, "popular-guides-list");
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<p>Error loading guides.</p>";
    }
}

// Search for guides based on destination
async function searchGuides() {
    const destination = document.getElementById("destination-input").value.trim();
    if (!destination) {
        alert("Please enter a destination.");
        return;
    }

    const container = document.getElementById("guides-list");
    container.innerHTML = "<p>Searching for guides...</p>";

    try {
        const response = await fetch(`${API_BASE_URL}/search-guides?location=${destination}`);
        if (!response.ok) throw new Error("Failed to fetch guides.");
        
        const guides = await response.json();
        displayGuides(guides, "guides-list");
    } catch (error) {
        console.error("Error fetching guides:", error);
        container.innerHTML = "<p>Error finding guides. Try again.</p>";
    }
}

// Display guides
function displayGuides(guides, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!guides || guides.length === 0) {
        container.innerHTML = "<p>No guides found.</p>";
        return;
    }

    guides.forEach(guide => {
        const guideCard = document.createElement("div");
        guideCard.classList.add("guide-card");

        guideCard.innerHTML = `
            <h3>${guide.name}</h3>
            <p><strong>Location:</strong> ${guide.locations || "Not specified"}</p>
            <p><strong>Experience:</strong> ${guide.experience || 0} years</p>
            <p><strong>Rating:</strong> ⭐ ${guide.rating || "N/A"}/5</p>
            <button onclick="chatWithGuide('${guide.id}')">Chat Now</button>
            <button onclick="viewTours('${guide.id}')">View Tours</button>

        `;

        container.appendChild(guideCard);
    });
}
async function viewTours(guideId) {
    try {
        const response = await fetch(`${API_BASE_URL}/guide/${guideId}/tours`);
        const tours = await response.json();

        const tourModal = document.getElementById("tourModal");
        const tourDetailsContainer = document.getElementById("tourDetailsContainer");
        const closeModal = document.getElementById("closeTourModal");

        if (tours.length === 0) {
            tourDetailsContainer.innerHTML = "<p>No upcoming tours.</p>";
        } else {
            tourDetailsContainer.innerHTML = tours.map(tour => `
                <div class="tour-card">
                    <p><strong>Destination:</strong> ${tour.destination}</p>
                    <p><strong>Date:</strong> ${tour.date}</p>
                    <p><strong>International:</strong> ${tour.is_international ? "Yes" : "No"}</p>
                    <p><strong>Rate:</strong> ${tour.rate}</p>
                    <p><strong>Description:</strong> ${tour.description || "N/A"}</p>
                    <button class="book-btn" onclick="bookTour('${guideId}', '${tour.destination}', '${tour.date}')">Book Now</button>
                    <hr>
                </div>
            `).join("");
        }

        tourModal.style.display = "flex";

        closeModal.onclick = () => tourModal.style.display = "none";
        window.onclick = (event) => {
            if (event.target == tourModal) {
                tourModal.style.display = "none";
            }
        };
    } catch (err) {
        console.error("Error fetching tours:", err);
        alert("Could not load tours. Try again later.");
    }
}

async function bookTour(guideId, destination, date) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to book a tour.");
        return;
    }

    let travelerId;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        travelerId = payload.id;
    } catch (e) {
        console.error("Invalid token.");
        return;
    }

    // ✅ Format date for MySQL (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split("T")[0];

    try {
        const response = await fetch(`${API_BASE_URL}/book-tour`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                guideId,
                travelerId,
                destination,
                date: formattedDate  // ✅ Fix applied here
            })
        });

        const result = await response.json();
        if (result.success) {
            alert("Tour booked successfully!");
        } else {
            alert(result.message || "Booking failed.");
        }
    } catch (err) {
        console.error("Booking error:", err);
        alert("Something went wrong.");
    }
}


// Redirect to chat page
function chatWithGuide(guideId) {
    window.location.href = `chat.html?guide=${guideId}`;
}
