let apiKey = "27489082aa41251e257d12bb346ed29e";

navigator.geolocation.getCurrentPosition(
  async function (position) {
    try {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;

      // Fetch Weather Data
      let weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      let data = await weatherResponse.json();
      console.log("Weather API Response:", data);

      if (!data.main || !data.main.temp) {
        alert("Weather data unavailable. Try again later.");
        return;
      }

      document.getElementById("metric").innerHTML = Math.round(data.main.temp) + "°";
      document.getElementById("weather-main").innerHTML = data.weather[0].description;
      document.getElementById("humidity").innerHTML = data.main.humidity + "%";
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch weather data.");
    }
  },
  (error) => alert("Location access denied. Enable it in your browser settings.")
);
