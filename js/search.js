let apiKey = "1e3e8f230b6064d27976e41163a82b77";
let apiKeyAutoFill = "pk.b6327c1036d314f333a763635aef271a"; // LocationIQ API Key
let searchInput = document.querySelector(".searchinput");
let suggestionBox = document.getElementById("suggestions");

// Function to fetch AQI data
async function fetchAQI(lat, lon) {
    let url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    let response = await fetch(url);
    if (response.ok) {
        let data = await response.json();
        return data.list[0].main.aqi; // AQI value (1 to 5)
    } else {
        console.error("Error fetching AQI data");
        return null;
    }
}

// Function to fetch weather data
async function search(city) {
    let url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;
    let response = await fetch(url);

    if (response.ok) {
        let data = await response.json();
        console.log(data);

        let box = document.querySelector(".return");
        box.style.display = "block";

        let message = document.querySelector(".message");
        message.style.display = "none";

        let errormessage = document.querySelector(".error-message");
        errormessage.style.display = "none";
        let weatherImg = document.querySelector(".weather-img");
        document.querySelector(".city-name").innerHTML = data.name;
        document.querySelector(".weather-temp").innerHTML = Math.floor(data.main.temp) + "°";
        document.querySelector(".wind").innerHTML = Math.floor(data.wind.speed) + " m/s";
        document.querySelector(".pressure").innerHTML = Math.floor(data.main.pressure) + " hPa";
        document.querySelector(".humidity").innerHTML = Math.floor(data.main.humidity) + "%";

        // Convert UTC time to local time using timezone offset
        function convertToLocalTime(utcTimestamp, timezoneOffset) {
            let localTime = new Date((utcTimestamp + timezoneOffset) * 1000);
            let hours = localTime.getUTCHours().toString().padStart(2, "0");
            let minutes = localTime.getUTCMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
        }

        // Get timezone offset from API
        let timezoneOffset = data.timezone; // Offset in seconds
        document.querySelector(".sunrise").innerHTML = convertToLocalTime(data.sys.sunrise, timezoneOffset);
        document.querySelector(".sunset").innerHTML = convertToLocalTime(data.sys.sunset, timezoneOffset);

// Fetch and update AQI data
let aqi = await fetchAQI(data.coord.lat, data.coord.lon);
if (aqi !== null) {
    document.querySelector(".aqi").innerHTML = `Pollution Level: <strong>${aqi}</strong>`;
} else {
    document.querySelector(".aqi").innerHTML = "Pollution Level: <strong>N/A</strong>";
}


        // Update weather icon
        let weatherCondition = data.weather[0].main;
        let iconMap = {
            "Rain": "img/rain.png",
            "Clear": "img/sun.png",
            "Snow": "img/snow.png",
            "Clouds": "img/cloud.png",
            "Smoke": "img/cloud.png",
            "Mist": "img/mist.png",
            "Fog": "img/mist.png",
            "Haze": "img/haze.png"
        };
        weatherImg.src = iconMap[weatherCondition] || "img/default.png";

    } else {
        document.querySelector(".return").style.display = "none";
        document.querySelector(".message").style.display = "none";
        document.querySelector(".error-message").style.display = "block";
    }
}

// Function to check if a city is available in OpenWeather API
async function isValidCity(city) {
    let url = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;
    let response = await fetch(url);
    return response.ok; // Returns true if city is valid, false otherwise
}

// Autocomplete function with validation
searchInput.addEventListener("input", async function () {
    let query = searchInput.value.trim();

    if (query.length < 2) {
        suggestionBox.innerHTML = "";
        return;
    }

    // Fetch suggestions from LocationIQ
    let response = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=${apiKeyAutoFill}&q=${query}&limit=5&format=json`);
    let data = await response.json();

    suggestionBox.innerHTML = ""; // Clear previous suggestions

    for (let place of data) {
        let city = place.display_name;

        if (await isValidCity(city)) {  // Check if the city exists in OpenWeather API
            let suggestion = document.createElement("div");
            suggestion.textContent = city;
            suggestion.classList.add("suggestion-item");

            suggestion.addEventListener("click", function () {
                searchInput.value = city;
                suggestionBox.innerHTML = ""; // Hide suggestions
                search(city); // Fetch weather data immediately
            });

            suggestionBox.appendChild(suggestion);
        }
    }
});

// Event listener for Enter key
searchInput.addEventListener('keydown', function(event) {
    if (event.keyCode === 13 || event.which === 13) {
        search(searchInput.value);
    }
});
