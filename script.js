//accessing html elements using Document Object Model

const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".Weather-cards");
const dropdown = document.querySelector(".recent-cities");


//This is the API key for taken API to fetch weather Data

const API_KEY =  "8afa574ea3e0c01fa882f674b4c76c98" ; 


// This section updates the data dynamically after searching the details are updated in the weather card

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    return `
      <div class="details">
        <h2 class="text-2xl font-bold">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
        <h4 class="mt-6 text-lg font-semibold">Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4 class="mt-6 text-lg font-semibold">Wind : ${weatherItem.wind.speed} M/S</h4>
        <h4 class="mt-6 text-lg font-semibold">Humidity : ${weatherItem.main.humidity}%</h4>
      </div>
      <div class="icon text-center">
        <img class="max-w-[120px] mx-auto mb-4 drop-shadow" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon"/>
        <h4 class="capitalize text-white">${weatherItem.weather[0].description}</h4>
      </div>
    `;
  } else 
    { //this code will update the data in five forecast days which changes dyanmically using API
    return `  
      <li class="card list-none text-white text-center p-5 w-[85%] mx-auto sm:w-[calc(100%/2-10px)] md:w-[calc(100%/3-15px)] lg:w-[calc(100%/5-6px)] rounded bg-gray-400/30 backdrop-blur shadow">
        <h3 class="text-lg font-semibold">(${weatherItem.dt_txt.split(" ")[0]})</h3>
        <img class="max-w-[70px] my-2 mx-auto drop-shadow" src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon"/>
        <h4 class="mt-2 text-base font-semibold">Temp : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4 class="mt-2 text-base font-semibold">Wind : ${weatherItem.wind.speed} M/S</h4>
        <h4 class="mt-2 text-base font-semibold">Humidity : ${weatherItem.main.humidity}%</h4>
      </li>
    `;
  }
};



// It is a local storage to save Recent seached cities

const saveToRecentCities = (cityName) => {
  let storedCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  storedCities = storedCities.filter(c => c.toLowerCase() !== cityName.toLowerCase());
  storedCities.unshift(cityName);
  if (storedCities.length > 5) storedCities.pop();
  localStorage.setItem("recentCities", JSON.stringify(storedCities));
  updateDropdown();
};



// This section is for Drop down menu after one search it will display below the city input field

const updateDropdown = () => {
  const storedCities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (storedCities.length === 0) {
    dropdown.classList.add("hidden");
  } else {
    dropdown.classList.remove("hidden");
    dropdown.innerHTML = '<option disabled selected>Select City</option>';
    storedCities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      dropdown.appendChild(option);
    });
  }
};



// Handling dropdown selection

dropdown.addEventListener("change", (e) => {
  const selectedCity = e.target.value;
  cityInput.value = selectedCity;
  getCityCoordinates(selectedCity);
});



// Here used Weather API to fetch the data using lattitudes and longitudes

const getWeatherDetails = (cityName, lat, lon) => {
  saveToRecentCities(cityName);
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }
      });
    })
    .catch(() => alert("⚠️ Failed to load weather data. Please try again later."));
};


// This section will get city coordinates from the APi based on given city name

const getCityCoordinates = (cityName = cityInput.value.trim()) => {
  if (cityName === "") {
    alert("⚠️ Please enter a city name before searching.")
    return;
  }
  const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`❌ Invalid Location "${cityName}". Please check the spelling or try another city.`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => alert(`No Coordinates found for ${cityName}. Failed to load city data Please try again later.`));
};


// herer we can get user location access to get user location forecast data

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          if(!data.length){
            
          }
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => alert("⚠️ Failed to get your location. Please try again later"));
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("📍 Geolocation request denied. Please allow location permission and try again.");
      }else {
        console.error("❌ Geolocation error:", error);
        alert("⚠️ Unable to access your location. Please try again later.");
      }
    }
  );
};

// Event listeners for 
locationBtn.addEventListener("click", getUserCoordinates);
searchBtn.addEventListener("click", () => getCityCoordinates());
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());


updateDropdown();


























