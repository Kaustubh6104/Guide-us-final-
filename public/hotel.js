// Sample hotel data
const hotels = [
    {
        name: "Myra's House",
        destination: "kolhapur",
        rating: "⭐⭐⭐⭐⭐",
        rooms: "3 bedrooms",
        price: "4815 rs per night",
        img: "myra2.jpeg"
    },
    {
        name: "Saffron stays",
        destination: "Konkan",
        rating: "⭐⭐⭐⭐",
        rooms:"4 bedrooms",
        price: "9000 rs per night",
        img: "saffron.jpeg"
    },
    {
        name: "EKO stay",
        destination: "Allibaug",
        rating: "⭐⭐⭐⭐⭐",
        rooms : "5 bedrooms",
        price: "12000 rs per night",
        img: "eko.jpeg"
    }
];

// Function to display hotels
function displayHotels(filteredHotels) {
    let hotelContainer = document.getElementById("hotels-list");
    hotelContainer.innerHTML = ""; // Clear previous results

    if (filteredHotels.length === 0) {
        hotelContainer.innerHTML = "<p style='text-align: center;'>No hotels found for this destination.</p>";
        return;
    }

    filteredHotels.forEach(hotel => {
        let hotelCard = document.createElement("div");
        hotelCard.classList.add("hotel-card");

        hotelCard.innerHTML = `
            <img src="${hotel.img}" alt="${hotel.name}">
            <h3>${hotel.name}</h3>
            <h2>${hotel.destination}</h2>
            <p class="rating">${hotel.rating}</p>
            <h4>${hotel.rooms}</h4>
            <p class="price">${hotel.price}</p>
            <button onclick="bookHotel('${hotel.name}')">Book Now</button>
        `;
        
        hotelContainer.appendChild(hotelCard);
    });
}

// Function to search hotels by destination
function searchHotels() {
    let destination = document.getElementById("hotel-search-input").value.trim().toLowerCase();
    if (destination === "") {
        alert("Please enter a destination.");
        return;
    }

    let filteredHotels = hotels.filter(hotel => hotel.destination.toLowerCase() === destination);
    displayHotels(filteredHotels);
}

// Dummy function for hotel booking
function bookHotel(hotelName) {
    alert(`Booking confirmed for ${hotelName}!`);
}

// Load all hotels initially
document.addEventListener("DOMContentLoaded", () => {
    displayHotels(hotels);
});
