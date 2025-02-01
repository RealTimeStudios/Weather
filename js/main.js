<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Weather App</title>
  <style>
    /* Add your CSS styles here */
  </style>
</head>
<body>
  <!-- Example UI Elements -->
  <div id="weather">
    <h2 id="city-name"></h2>
    <div id="current-weather">
      <span id="metric"></span>
      <span id="weather-main"></span>
      <img class="weather-icon" src="" alt="Current Weather" />
      <div>
        Humidity: <span id="humidity"></span>%
      </div>
      <div>
        Feels like: <span id="feels-like"></span>°
      </div>
      <div>
        Min: <span id="temp-min-today"></span>
        Max: <span id="temp-max-today"></span>
      </div>
    </div>
    <div id="forecast-box"></div>
  </div>

  <!-- Optionally, you could have a button to trigger location detection -->
  <!-- <button id="getLocation">Get Weather</button> -->

  <script>
    const apiKey = "27489082aa41251e257d12bb346ed29e";

    // Function to update the main weather UI
    function updateCurrentWeather(data) {
      document.getElementById("city-name").innerHTML = data.city.name;
      document.getElementById("metric").innerHTML =
        Math.floor(data.list[0].main.temp) + "°";
      document.getElementById("weather-main").innerHTML =
        data.list[0].weather[0].description;
      document.getElementById("humidity").innerHTML =
        Math.floor(data.list[0].main.humidity);
      document.getElementById("feels-like").innerHTML =
        Math.floor(data.list[0].main.feels_like);
      document.getElementById("temp-min-today").innerHTML =
        Math.floor(data.list[0].main.temp_min) + "°";
      document.getElementById("temp-max-today").innerHTML =
        Math.floor(data.list[0].main.temp_max) + "°";

      const weatherCondition = data.list[0].weather[0].main.toLowerCase();
      let iconSrc = "img/sun.png"; // default icon

      if (weatherCondition === "rain") {
        iconSrc = "img/rain.png";
      } else if (
        weatherCondition === "clear" ||
        weatherCondition === "clear sky"
      ) {
        iconSrc = "img/sun.png";
      } else if (weatherCondition === "snow") {
        iconSrc = "img/snow.png";
      } else if (
        weatherCondition === "clouds" ||
        weatherCondition === "smoke"
      ) {
        iconSrc = "img/cloud.png";
      } else if (
        weatherCondition === "mist" ||
        weatherCondition === "fog"
      ) {
        iconSrc = "img/mist.png";
      } else if (weatherCondition === "haze") {
        iconSrc = "img/haze.png";
      }

      // Update both icons if needed
      document.querySelector(".weather-icon").src = iconSrc;
    }

    // Function to display 5-day forecast
    function displayForecast(data) {
      const dailyForecasts = {};
      const forecastBox = document.getElementById("forecast-box");
      let forecastHTML = "";

      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        // Use built-in Date to get day of week
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const day = new Date(date).getDay();

        // Only set the forecast for the first entry of each day
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = {
            day: dayName[day],
            temperature: Math.floor(item.main.temp) + "°",
            description: item.weather[0].description,
            weatherMain: item.weather[0].main.toLowerCase(),
          };
        }
      });

      // Build the forecast HTML
      for (const date in dailyForecasts) {
        let imgSrc = "img/sun.png"; // default

        switch (dailyForecasts[date].weatherMain) {
          case "rain":
            imgSrc = "img/rain.png";
            break;
          case "clear":
          case "clear sky":
            imgSrc = "img/sun.png";
            break;
          case "snow":
            imgSrc = "img/snow.png";
            break;
          case "clouds":
          case "smoke":
            imgSrc = "img/cloud.png";
            break;
          case "mist":
          case "fog":
            imgSrc = "img/mist.png";
            break;
          case "haze":
            imgSrc = "img/haze.png";
            break;
        }

        forecastHTML += `
          <div class="weather-forecast-box">
            <div class="day-weather">
              <span>${dailyForecasts[date].day}</span>
            </div>
            <div class="weather-icon-forecast">
              <img src="${imgSrc}" alt="${dailyForecasts[date].weatherMain}" />
            </div>
            <div class="temp-weather">
              <span>${dailyForecasts[date].temperature}</span>
            </div>
            <div class="weather-main-forecast">
              ${dailyForecasts[date].description}
            </div>
          </div>
        `;
      }

      forecastBox.innerHTML = forecastHTML;
    }

    // Fetch weather data using city name (obtained via reverse geocoding)
    async function fetchWeather(cityName) {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Weather data not available");
        }
        const data = await response.json();
        console.log("Current Weather Data:", data);
        updateCurrentWeather(data);
        displayForecast(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    // Reverse geocode to get the city name and then fetch weather data
    async function getCityAndWeather(lat, lon) {
      const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`;
      try {
        const response = await fetch(geoUrl);
        if (!response.ok) {
          throw new Error("Reverse geocoding failed");
        }
        const geoData = await response.json();
        if (geoData && geoData.length > 0) {
          const cityName = geoData[0].name;
          console.log("Detected city:", cityName);
          await fetchWeather(cityName);
        } else {
          console.error("No geolocation data returned");
        }
      } catch (error) {
        console.error("Error during reverse geocoding:", error);
      }
    }

    // Success callback for geolocation
    function handlePosition(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log("Latitude:", lat, "Longitude:", lon);
      getCityAndWeather(lat, lon);
    }

    // Error callback for geolocation
    function handleGeoError(error) {
      console.error("Geolocation error:", error);
      alert("Error detecting your location: " + error.message);
    }

    // Check if geolocation is supported, then request the position.
    if ("geolocation" in navigator) {
      // Optionally, if you want to trigger on a button click, uncomment below:
      // document.getElementById("getLocation").addEventListener("click", () => {
      //   navigator.geolocation.getCurrentPosition(handlePosition, handleGeoError, { timeout: 10000 });
      // });
      navigator.geolocation.getCurrentPosition(handlePosition, handleGeoError, { timeout: 10000 });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  </script>
</body>
</html>
