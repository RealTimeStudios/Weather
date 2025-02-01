let apiKey = "27489082aa41251e257d12bb346ed29e";

// Hardcode location for testing (comment this out to use geolocation)
var lat = 40.7128; // New York City latitude
var lon = -74.0060; // New York City longitude

navigator.geolocation.getCurrentPosition(
    async function (position) {
        try {
            // Uncomment these lines to use geolocation
            // var lat = position.coords.latitude;
            // var lon = position.coords.longitude;
            console.log("Latitude:", lat, "Longitude:", lon);

            // Fetch city name using latitude and longitude
            var mapResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`);
            if (!mapResponse.ok) {
                throw new Error(`Geocoding API error: ${mapResponse.statusText}`);
            }
            var userdata = await mapResponse.json();
            console.log("Geocoding API Response:", userdata);

            if (!userdata || userdata.length === 0) {
                throw new Error("No location data found");
            }

            let loc = userdata[0].name;
            console.log("Location:", loc);

            // Fetch weather data using city name
            let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?&units=metric&q=${loc}&appid=${apiKey}`);
            if (!weatherResponse.ok) {
                throw new Error(`Weather API error: ${weatherResponse.statusText}`);
            }
            let data = await weatherResponse.json();
            console.log("Weather API Response:", data);

            if (!data || !data.list || data.list.length === 0) {
                throw new Error("Invalid API response: No weather data found.");
            }

            // Display current weather info
            let cityMain = document.getElementById("city-name");
            let cityTemp = document.getElementById("metric");
            let weatherMain = document.querySelectorAll("#weather-main");
            let mainHumidity = document.getElementById("humidity");
            let mainFeel = document.getElementById("feels-like");
            let weatherImg = document.querySelector(".weather-icon");
            let weatherImgs = document.querySelector(".weather-icons");
            let tempMinWeather = document.getElementById("temp-min-today");
            let tempMaxWeather = document.getElementById("temp-max-today");

            if (cityMain) cityMain.innerHTML = data.city.name;
            if (cityTemp) cityTemp.innerHTML = Math.floor(data.list[0].main.temp) + "°";
            if (weatherMain[0]) weatherMain[0].innerHTML = data.list[0].weather[0].description;
            if (weatherMain[1]) weatherMain[1].innerHTML = data.list[0].weather[0].description;
            if (mainHumidity) mainHumidity.innerHTML = Math.floor(data.list[0].main.humidity);
            if (mainFeel) mainFeel.innerHTML = Math.floor(data.list[0].main.feels_like);
            if (tempMinWeather) tempMinWeather.innerHTML = Math.floor(data.list[0].main.temp_min) + "°";
            if (tempMaxWeather) tempMaxWeather.innerHTML = Math.floor(data.list[0].main.temp_max) + "°";

            let weatherCondition = data.list[0].weather[0].main.toLowerCase();
            console.log("Weather Condition:", weatherCondition);

            if (weatherImg && weatherImgs) {
                if (weatherCondition.includes("rain")) {
                    weatherImg.src = "img/rain.png";
                    weatherImgs.src = "img/rain.png";
                } else if (weatherCondition.includes("clear")) {
                    weatherImg.src = "img/sun.png";
                    weatherImgs.src = "img/sun.png";
                } else if (weatherCondition.includes("snow")) {
                    weatherImg.src = "img/snow.png";
                    weatherImgs.src = "img/snow.png";
                } else if (weatherCondition.includes("cloud") || weatherCondition.includes("smoke")) {
                    weatherImg.src = "img/cloud.png";
                    weatherImgs.src = "img/cloud.png";
                } else if (weatherCondition.includes("mist") || weatherCondition.includes("fog")) {
                    weatherImg.src = "img/mist.png";
                    weatherImgs.src = "img/mist.png";
                } else if (weatherCondition.includes("haze")) {
                    weatherImg.src = "img/haze.png";
                    weatherImgs.src = "img/haze.png";
                } else {
                    weatherImg.src = "img/sun.png"; // Default image
                    weatherImgs.src = "img/sun.png";
                }
            }

            // Fetch and display 5-day forecast data
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${data.city.name}&appid=${apiKey}&units=metric`;

            fetch(forecastUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Forecast API error: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("5-Day Forecast for", data.city.name);
                    displayForecast(data);
                })
                .catch(error => {
                    console.error("Error fetching forecast:", error);
                });

            function displayForecast(data) {
                const dailyForecasts = {};
                let forecast = document.getElementById('forecast-box');
                let forecastbox = "";

                data.list.forEach(item => {
                    const date = item.dt_txt.split(' ')[0];
                    let dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    let day = new Date(date).getDay();

                    if (!dailyForecasts[date]) {
                        dailyForecasts[date] = {
                            day_today: dayName[day],
                            temperature: Math.floor(item.main.temp) + "°",
                            description: item.weather[0].description,
                            weatherImg: item.weather[0].main.toLowerCase()
                        };
                    }
                });

                console.log("Daily Forecasts:", dailyForecasts);

                for (const date in dailyForecasts) {
                    let imgSrc = "";

                    switch (dailyForecasts[date].weatherImg) {
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
                            imgSrc = "img/mist.png";
                            break;
                        case "haze":
                            imgSrc = "img/haze.png";
                            break;
                        default:
                            imgSrc = "img/sun.png";
                    }

                    forecastbox += `
                    <div class="weather-forecast-box">
                        <div class="day-weather">
                            <span>${dailyForecasts[date].day_today}</span>
                        </div>
                        <div class="weather-icon-forecast">
                            <img src="${imgSrc}" />
                        </div>
                        <div class="temp-weather">
                            <span>${dailyForecasts[date].temperature}</span>
                        </div>
                        <div class="weather-main-forecast">${dailyForecasts[date].description}</div>
                    </div>`;
                }

                if (forecast) forecast.innerHTML = forecastbox;
            }
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
