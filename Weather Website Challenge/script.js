const apiKey = "2963113955bfc93477fdec7515904179"; // Replace with your API key
const apiURL = "https://api.openweathermap.org/data/2.5/weather?q=";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const card = document.querySelector(".card");
const weatherT = document.querySelector(".weather");
const hourlyWeatherContainer = document.querySelector(".hourly_weather");
const forecastContainer = document.querySelector(".day-forecast");


document.querySelector(".current-weather").style.display = "none";
document.querySelector(".other").style.display = "none";
card.classList.remove("expanded");

async function checkWeather(city) {
    const response = await fetch(`${apiURL}${city}&units=metric&appid=${apiKey}`);

    if (response.status == 404) {
        
        document.querySelector(".current-weather").style.display = "none";
        document.querySelector(".other").style.display = "none";
        document.body.style.backgroundImage = "url('https://lipsumhub.com/_next/static/media/404-not-found.cfc5b409.svg')";
        document.querySelector(".alert").innerHTML = "City Not Found Try Again";
        document.querySelector(".idk2").style.marginLeft = "45px";
        document.querySelector(".atxt").style.display = "none";

        card.classList.remove("expanded");
    } else {
        const data = await response.json();
        console.log("Current Weather Data:", data);

        // Update current weather details
        document.querySelector(".location").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + "km/h";
        document.querySelector(".air-pressure").innerHTML = data.main.pressure + "hPa";
        document.querySelector(".feels-like").innerHTML = data.main.feels_like + "°c";

        // 🕒 Adjust Time Based on City's Timezone
        const timezoneOffset = data.timezone; // Offset in seconds
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
        const cityTime = new Date(utcTime + timezoneOffset * 1000); // Adjust for city's timezone

        // Extract Date
        const formattedDate = cityTime.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        // Extract Time & Timezone
        const formattedTime = cityTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

        const timeZoneName = cityTime.toLocaleTimeString("en-US", {
            timeZoneName: "short"
        }).split(" ").slice(-1).join(" "); // Extracts only the timezone part

        // Update the DOM
        document.getElementById("date").innerHTML = formattedDate;
        document.querySelector(".time-zone").innerHTML = `${formattedTime} ${timeZoneName}`;

        // Update weather icon and description
        const weatherMain = data.weather[0].main; // Get the weather condition (e.g., "Clouds", "Rain")
        const iconCode = data.weather[0].icon; // Get the icon code (e.g., "02d", "09d")
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; // Update the weather icon
        weatherT.innerHTML = weatherMain; // Update the weather description

        // 🌅 Update Sunrise and Sunset Times
        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        document.querySelector(".sunrise").innerHTML = sunriseTime;
        document.querySelector(".sunset").innerHTML = sunsetTime;

        // Fetch 5-Day/3-Hour Forecast
        const forecastResponse = await fetch(`${forecastURL}${city}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();
        console.log("5-Day/3-Hour Forecast Data:", forecastData);

        // Display 8-hour forecast
        displayHourlyForecast(forecastData.list, timezoneOffset);

        // Display 5-day forecast
        display5DayForecast(forecastData.list);

        // Show weather sections
        document.querySelector(".current-weather").style.display = "block";
        document.querySelector(".other").style.display = "block";
        document.body.style.backgroundImage = "none";
        document.querySelector(".idk2").style.display = "none";
        card.classList.add("expanded");
    }
}

// Function to display 8-hour forecast
function displayHourlyForecast(forecastList, timezoneOffset) {
    hourlyWeatherContainer.innerHTML = ''; // Clear previous content

    // Loop through the first 8 entries (3-hour intervals)
    for (let i = 0; i < 8; i++) {
        const hourData = forecastList[i];
        const timestamp = hourData.dt * 1000; // Convert to milliseconds
        const cityTime = new Date(timestamp + timezoneOffset * 1000); // Adjust for city's timezone
        const time = cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = Math.round(hourData.main.temp);
        const icon = hourData.weather[0].icon;

        // Create HTML for each hour
        const hourCard = `
            <div class="card">
                <p>${time}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
                <p>${temp}°C</p>
            </div>
        `;

        hourlyWeatherContainer.innerHTML += hourCard; // Add to the container
    }
}

// Function to display 5-day forecast (without description)
function display5DayForecast(forecastList) {
    forecastContainer.innerHTML = '';

    const dailyForecasts = {};

    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const hour = date.getHours();

        if (!dailyForecasts[day] || Math.abs(hour - 12) < Math.abs(dailyForecasts[day].hour - 12)) {
            dailyForecasts[day] = { ...forecast, hour };
        }
    });

    const fiveDayForecasts = Object.values(dailyForecasts).slice(0, 5);

    fiveDayForecasts.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;

        const dayCard = `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
                    <span>${temp}°C</span>
                </div>
                <p class="date-f">${date}</p>
            </div>
        `;

        forecastContainer.innerHTML += dayCard;
    });
}

// Event listener for the search button
searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});
