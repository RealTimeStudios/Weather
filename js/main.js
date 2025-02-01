let apiKey = "27489082aa41251e257d12bb346ed29e";

navigator.geolocation.getCurrentPosition(
  async function (position) {
    try {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      console.log("Latitude:", lat, "Longitude:", lon);

      let mapResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`
      );
      if (!mapResponse.ok) throw new Error(`Geocoding API error: ${mapResponse.statusText}`);
      let geoData = await mapResponse.json();
      if (!geoData || geoData.length === 0) throw new Error("No location data found");
      
      let cityFromGeo = geoData[0].name;
      console.log("Location:", cityFromGeo);

      let weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      );
      if (!weatherResponse.ok) throw new Error(`Weather API error: ${weatherResponse.statusText}`);
      let data = await weatherResponse.json();
      if (!data || !data.list || data.list.length === 0) throw new Error("Invalid API response: No weather data found.");

      let cityMain = document.getElementById("city-name");
      let cityTemp = document.getElementById("metric");
      let weatherMain = document.querySelectorAll("#weather-main");
      let mainHumidity = document.getElementById("humidity");
      let mainFeel = document.getElementById("feels-like");
      let weatherImg = document.querySelector(".weather-icon");
      let weatherImgs = document.querySelector(".weather-icons");
      let tempMinWeather = document.getElementById("temp-min-today");
      let tempMaxWeather = document.getElementById("temp-max-today");

      if (cityMain) cityMain.innerHTML = data.city.name || cityFromGeo;
      if (cityTemp) cityTemp.innerHTML = Math.floor(data.list[0].main.temp) + "°";
      if (weatherMain[0]) weatherMain[0].innerHTML = capitalizeWords(data.list[0].weather[0].description);
      if (weatherMain[1]) weatherMain[1].innerHTML = capitalizeWords(data.list[0].weather[0].description);
      if (mainHumidity) mainHumidity.innerHTML = Math.floor(data.list[0].main.humidity);
      if (mainFeel) mainFeel.innerHTML = Math.floor(data.list[0].main.feels_like);
      if (tempMinWeather) tempMinWeather.innerHTML = Math.floor(data.list[0].main.temp_min) + "°";
      if (tempMaxWeather) tempMaxWeather.innerHTML = Math.floor(data.list[0].main.temp_max) + "°";

      let weatherCondition = data.list[0].weather[0].main.toLowerCase();
      console.log("Weather Condition:", weatherCondition);

      let weatherIcons = {
        rain: "img/rain.png",
        clear: "img/sun.png",
        snow: "img/snow.png",
        clouds: "img/cloud.png",
        smoke: "img/cloud.png",
        mist: "img/mist.png",
        fog: "img/mist.png",
        haze: "img/haze.png",
        default: "img/sun.png",
      };

      let imgSrc = weatherIcons[weatherCondition] || weatherIcons.default;
      if (weatherImg && weatherImgs) {
        weatherImg.src = imgSrc;
        weatherImgs.src = imgSrc;
      }

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      let forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
      let forecastData = await forecastResponse.json();

      displayForecast(forecastData);
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred: " + error.message);
    }
  },
  function (error) {
    if (error.code === error.PERMISSION_DENIED) {
      alert("Location access is required for this app to work. Please enable it in your browser settings.");
    } else {
      alert("Error detecting your location. Please try again.");
    }
  }
);

function displayForecast(data) {
  const dailyForecasts = {};
  let forecastBox = document.getElementById("forecast-box");
  let forecastHTML = "";
  let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    let day = new Date(date).getDay();

    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        day: dayNames[day],
        temperature: Math.floor(item.main.temp) + "°",
        description: capitalizeWords(item.weather[0].description),
        weatherImg: item.weather[0].main.toLowerCase()
      };
    }
  });

  for (const date in dailyForecasts) {
    let imgSrc = weatherIcons[dailyForecasts[date].weatherImg] || weatherIcons.default;

    forecastHTML += `
      <div class="weather-forecast-box">
        <div class="day-weather">
          <span>${dailyForecasts[date].day}</span>
        </div>
        <div class="weather-icon-forecast">
          <img src="${imgSrc}" alt="${dailyForecasts[date].weatherImg}" />
        </div>
        <div class="temp-weather">
          <span>${dailyForecasts[date].temperature}</span>
        </div>
        <div class="weather-main-forecast">${dailyForecasts[date].description}</div>
      </div>
    `;
  }

  if (forecastBox) forecastBox.innerHTML = forecastHTML;
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}
