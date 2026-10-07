// ===============================
// WEATHER DASHBOARD
// Open-Meteo API
// ===============================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const dateElement = document.getElementById("date");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");
const visibility = document.getElementById("visibility");

const forecastContainer =
    document.getElementById("forecastContainer");


// ===============================
// WEATHER CODE → DESCRIPTION
// ===============================

function getWeatherDescription(code) {

    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail"
    };

    return weatherCodes[code] || "Unknown weather";
}


// ===============================
// WEATHER ICON
// ===============================

function getWeatherIcon(code) {

    if (code === 0) return "☀️";

    if (code === 1 || code === 2) return "🌤️";

    if (code === 3) return "☁️";

    if (code === 45 || code === 48) return "🌫️";

    if (code >= 51 && code <= 55) return "🌦️";

    if (code >= 61 && code <= 65) return "🌧️";

    if (code >= 71 && code <= 75) return "❄️";

    if (code >= 80 && code <= 82) return "🌦️";

    if (code >= 95) return "⛈️";

    return "🌡️";
}


// ===============================
// SEARCH CITY
// ===============================

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    getWeather(city);
});


// Press Enter to search
cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});


// ===============================
// GET CITY COORDINATES
// ===============================

async function getCoordinates(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for the city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found.");
    }

    return data.results[0];
}


// ===============================
// GET WEATHER DATA
// ===============================

async function getWeather(city) {

    try {

        weatherDescription.textContent =
            "Loading weather...";

        const location = await getCoordinates(city);

        const latitude = location.latitude;
        const longitude = location.longitude;

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
            `&timezone=auto` +
            `&forecast_days=5`;

        const response = await fetch(weatherURL);

        if (!response.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const data = await response.json();

        displayWeather(location, data);

    } catch (error) {

        console.error(error);

        cityName.textContent = "Error";
        weatherDescription.textContent = error.message;

        temperature.textContent = "--";
        humidity.textContent = "--%";
        windSpeed.textContent = "-- km/h";
        feelsLike.textContent = "--°C";
        visibility.textContent = "-- km";
    }
}


// ===============================
// DISPLAY CURRENT WEATHER
// ===============================

function displayWeather(location, data) {

    const current = data.current;

    // City
    cityName.textContent =
        `${location.name}, ${location.country_code}`;

    // Date
    dateElement.textContent =
        new Date(current.time).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    // Temperature
    temperature.textContent =
        Math.round(current.temperature_2m);

    // Description
    const description =
        getWeatherDescription(current.weather_code);

    weatherDescription.textContent =
        `${getWeatherIcon(current.weather_code)} ${description}`;

    // Humidity
    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    // Wind
    windSpeed.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    // Feels like
    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    // Visibility
    visibility.textContent =
        `${(current.visibility / 1000).toFixed(1)} km`;

    // Forecast
    displayForecast(data.daily);
}


// ===============================
// DISPLAY 5-DAY FORECAST
// ===============================

function displayForecast(daily) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i]);

        const dayName =
            date.toLocaleDateString("en-IN", {
                weekday: "short"
            });

        const icon =
            getWeatherIcon(daily.weather_code[i]);

        const description =
            getWeatherDescription(daily.weather_code[i]);

        const maxTemp =
            Math.round(daily.temperature_2m_max[i]);

        const minTemp =
            Math.round(daily.temperature_2m_min[i]);

        const card =
            document.createElement("div");

        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${dayName}</h3>

            <p class="forecast-icon">
                ${icon}
            </p>

            <p>
                ${maxTemp}° / ${minTemp}°
            </p>

            <small>
                ${description}
            </small>
        `;

        forecastContainer.appendChild(card);
    }
}


// ===============================
// DEFAULT CITY
// ===============================

getWeather("Chennai");