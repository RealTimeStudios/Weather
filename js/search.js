let apiKey = "1e3e8f230b6064d27976e41163a82b77";
let searchInput = document.querySelector(".searchinput");
let suggestionsBox = document.createElement("ul");
suggestionsBox.classList.add("suggestions");
document.querySelector(".search").appendChild(suggestionsBox);

let cityList = [];

// Fetch city data
fetch("cities.json")
    .then(response => response.json())
    .then(data => {
        cityList = data;
        console.log("City data loaded:", cityList); // Debugging
    })
    .catch(error => console.error("Error loading city list:", error));

// Function to calculate Levenshtein Distance
function getLevenshteinDistance(a, b) {
    if (!a || !b) return 0;
    
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            matrix[i][j] = a[i - 1] === b[j - 1]
                ? matrix[i - 1][j - 1]
                : Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1);
        }
    }

    return matrix[a.length][b.length];
}

// Function to get closest city matches
function getClosestCities(query) {
    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    let matches = cityList
        .map(city => ({ city, score: getLevenshteinDistance(query.toLowerCase(), city.toLowerCase()) }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 5); // Get top 5 closest matches

    suggestionsBox.innerHTML = "";
    matches.forEach(match => {
        let listItem = document.createElement("li");
        listItem.textContent = match.city;
        listItem.onclick = () => {
            searchInput.value = match.city;
            suggestionsBox.innerHTML = "";
        };
        suggestionsBox.appendChild(listItem);
    });
}

// Listen for input changes and show suggestions
searchInput.addEventListener("input", () => getClosestCities(searchInput.value));

// Trigger search on Enter key
searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        let city = searchInput.value.trim();
        if (city) {
            search(city); // Call search function
            suggestionsBox.innerHTML = ""; // Hide suggestions
        }
    }
});
