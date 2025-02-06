let apiKey = "27489082aa41251e257d12bb346ed29e";

// Function to handle errors
function handleGeoError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("Location access denied. Enable it in your browser settings.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location unavailable. Please check your internet connection.");
      break;
    case error.TIMEOUT:
      alert("Location request timed out. Try again.");
      break;
    default:
      alert("An unknown error occurred.");
  }
}

// Request user's location
navigator.geolocation.getCurrentPosition(
  async function (position) {
    try {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      console.log("Latitude:", lat, "Longitude:", lon);

      // Reverse Geocoding to get City Name
      let mapResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
      );
      if (!mapResponse.ok) throw new Error(`Geocoding API Error: ${mapResponse.statusText}`);
      let geoData = await mapResponse.json();
      if (!geoData.length) throw new Error("No location data found.");
      let cityFromGeo = geoData[0].name;
      console.log("Detected City:", cityFromGeo);

      // Fetch Weather Data
      let weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      if (!weatherResponse.ok) throw new Error(`Weather API Error: ${weatherResponse.statusText}`);
      let data = await weatherResponse.json();
      console.log("Weather API Response:", data);

      // Update UI
      document.getElementById("city-name").innerHTML = data.name || cityFromGeo;
      document.getElementById("metric").innerHTML = Math.round(data.main.temp) + "°";
      document.getElementById("weather-main").innerHTML = data.weather[0].description;
      document.getElementById("humidity").innerHTML = data.main.humidity + "%";

      // Update Weather Icon
      let weatherCondition = data.weather[0].main.toLowerCase();
      let weatherImg = document.querySelector(".weather-icon");
      let iconMap = {
        rain: "img/rain.png",
        clear: "img/sun.png",
        snow: "img/snow.png",
        clouds: "img/cloud.png",
        mist: "img/mist.png",
        fog: "img/mist.png",
        haze: "img/haze.png",
      };
      weatherImg.src = iconMap[weatherCondition] || "img/sun.png";
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    }
  },
  handleGeoError,
  { timeout: 10000 } // Timeout in 10 seconds
);
