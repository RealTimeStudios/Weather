let apiKey = "1e3e8f230b6064d27976e41163a82b77";
let searchinput = document.querySelector(".searchinput");
let box = document.querySelector(".box");
let normalMessage = document.querySelector(".normal-message");
let errorMessage = document.querySelector(".error-message");
let addedMessage = document.querySelector(".added-message");

// Default cities
let defaultCities = ["Delhi", "Bengaluru", "Kochi"];

// Get stored cities and deleted defaults
let storedCities = JSON.parse(localStorage.getItem("savedCities")) || [];
let deletedDefaults = JSON.parse(localStorage.getItem("deletedDefaults")) || [];

// Function to get the date
let date = new Date().getDate();
let months_name = [
  "January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December"
];
let months = new Date().getMonth();
let year = new Date().getFullYear();
let FullDate = document.querySelector(".date");
FullDate.innerHTML = `${months_name[months]} ${date}, ${year}`;

// Function to fetch weather info
async function city(cityName) {
  let url = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityName}&appid=${apiKey}`
  );

  if (url.ok) {
    let data = await url.json();
    console.log(data);

    let pcsreen = document.querySelector(".pc");

    if (!box) {
      box = document.createElement("div");
      box.className = "box";
      pcsreen.appendChild(box);
    }

    let weatherBox = document.createElement("div");
    weatherBox.className = "weather-box";
    weatherBox.setAttribute("data-city", cityName);

    let nameDiv = document.createElement("div");
    nameDiv.className = "name";

    let cityElement = document.createElement("div");
    cityElement.className = "city-name city";
    cityElement.innerHTML = data.name;

    let tempElement = document.createElement("div");
    tempElement.className = "weather-temp temp";
    tempElement.innerHTML = Math.floor(data.main.temp) + "°";

    let weatherIconDiv = document.createElement("div");
    weatherIconDiv.className = "weather-icon";

    let weatherImg = document.createElement("img");
    weatherImg.className = "weather";

    if (data.weather[0].main === "Rain") {
      weatherImg.src = "img/rain.png";
    } else if (data.weather[0].main === "Clear") {
      weatherImg.src = "img/sun.png";
    } else if (data.weather[0].main === "Snow") {
      weatherImg.src = "img/snow.png";
    } else if (["Clouds", "Smoke"].includes(data.weather[0].main)) {
      weatherImg.src = "img/cloud.png";
    } else if (["Mist", "Fog"].includes(data.weather[0].main)) {
      weatherImg.src = "img/mist.png";
    } else if (data.weather[0].main === "Haze") {
      weatherImg.src = "img/haze.png";
    }

    weatherIconDiv.appendChild(weatherImg);
    nameDiv.appendChild(cityElement);
    nameDiv.appendChild(tempElement);
    weatherBox.appendChild(nameDiv);
    weatherBox.appendChild(weatherIconDiv);
    
    // Create delete button
    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "❌";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => removeCity(cityName, weatherBox));

    // Swipe to delete functionality
    let startX;
    weatherBox.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    });

    weatherBox.addEventListener("touchend", (e) => {
      let endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) {
        removeCity(cityName, weatherBox);
      }
    });

    weatherBox.appendChild(deleteBtn);
    box.appendChild(weatherBox);

    return weatherBox;
  } else {
    return "";
  }
}

// Function to remove a city and update localStorage
function removeCity(cityName, element) {
  element.remove(); // Remove from UI
  
  // Remove from savedCities
  storedCities = storedCities.filter(city => city !== cityName);
  localStorage.setItem("savedCities", JSON.stringify(storedCities));

  // Track deleted default cities
  if (defaultCities.includes(cityName) && !deletedDefaults.includes(cityName)) {
    deletedDefaults.push(cityName);
    localStorage.setItem("deletedDefaults", JSON.stringify(deletedDefaults));
  }
}

// Function to load cities from localStorage (excluding deleted default cities)
function loadSavedCities() {
  let deletedDefaults = JSON.parse(localStorage.getItem("deletedDefaults")) || [];

  // Load only the default cities that haven't been deleted
  defaultCities.forEach(cityName => {
    if (!deletedDefaults.includes(cityName)) {
      city(cityName);
    }
  });

  // Load user-added cities
  storedCities.forEach(city);
}

// Add section toggle
let section = document.querySelector(".add-section");
let navBtn = document.querySelector(".button");
let navIcon = document.querySelector(".btn-icon");

navBtn.addEventListener("click", () => {
  if (section.style.top === "-60rem") {
    section.style.top = "100px";
    navIcon.className = "fa-solid fa-circle-xmark";
  } else {
    section.style.top = "-60rem";
    navIcon.className = "fa-solid fa-circle-plus";
  }
});

// Search event listener
searchinput.addEventListener("keydown", async function (event) {
  if (event.keyCode === 13 || event.which === 13) {
    let cityName = searchinput.value.trim();
    if (!cityName) return;

    const weatherInfo = await city(cityName);
    if (weatherInfo) {
      normalMessage.style.display = "none";
      errorMessage.style.display = "none";
      addedMessage.style.display = "block";

      // Save new city
      if (!storedCities.includes(cityName)) {
        storedCities.push(cityName);
        localStorage.setItem("savedCities", JSON.stringify(storedCities));
      }
    } else {
      normalMessage.style.display = "none";
      errorMessage.style.display = "block";
      addedMessage.style.display = "none";
    }

    box.prepend(weatherInfo);
  }
});

// Load saved cities when the page loads
loadSavedCities();
