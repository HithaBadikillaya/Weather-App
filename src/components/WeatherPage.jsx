import React, { useState } from "react";
import axios from "axios";
import { Sun, Moon } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";
import DecryptedText from "./DecryptedText";
import "../index.css";

const API_KEY = "1e498aca55074cfc008542053fefbc9b";

const WeatherPage = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState("metric");

  const fetchWeather = async () => {
    if (!city) return;
    setError("");
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );
      setWeather(response.data);
    } catch {
      setError("City not found. Please check the spelling or try another city.");
      fetchCitySuggestions(city);
    }
  };

  const fetchCitySuggestions = async (query) => {
    if (!query.trim()) return;
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
      );
      if (response.data.length > 0) {
        setSuggestions(
          response.data
            .filter(
              (city) =>
                city.name &&
                city.country &&
                /^[a-zA-Z\s]+$/.test(city.name)
            )
            .map((city) => `${city.name}, ${city.country}`)
        );
      } else {
        setSuggestions([]);
        setError("No valid suggestions available. Please refine your search.");
      }
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
    }
  };

  const handleUnitChange = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  const getBackgroundByWeather = () => {
    if (!weather)
      return darkMode
        ? "linear-gradient(135deg, #2F3E46, #3A4E56, #2B3B43, #6B7C85)"
        : "linear-gradient(135deg, #AEDFF7, #FFE4B5, #FFFFFF, #DCDCDC)";
    const mainWeather = weather.weather[0].main.toLowerCase();
    if (darkMode) {
      if (mainWeather.includes("rain")) return "linear-gradient(135deg, #384B57, #2F3E46)";
      if (mainWeather.includes("cloud")) return "linear-gradient(135deg, #3A4E56, #2F3E46)";
      if (mainWeather.includes("clear")) return "linear-gradient(135deg, #2F3E46, #1B2A31)";
      if (mainWeather.includes("snow")) return "linear-gradient(135deg, #3A4E56, #2B3B43)";
      return "linear-gradient(135deg, #2F3E46, #3A4E56, #2B3B43, #6B7C85)";
    } else {
      if (mainWeather.includes("rain")) return "linear-gradient(135deg, #6A7BA2, #AEDFF7)";
      if (mainWeather.includes("cloud")) return "linear-gradient(135deg, #9CA3AF, #DCDCDC)";
      if (mainWeather.includes("clear")) return "linear-gradient(135deg, #FFD166, #FFE4B5)";
      if (mainWeather.includes("snow")) return "linear-gradient(135deg, #B2EBF2, #FFFFFF)";
      return "linear-gradient(135deg, #AEDFF7, #FFE4B5, #FFFFFF, #DCDCDC)";
    }
  };

  const formatLocalTime = (timezoneOffset) => {
    const localTime = new Date(Date.now() + timezoneOffset * 1000);
    return localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getTravelRecommendation = () => {
    if (!weather) return "";
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes("clear"))
      return "It’s best to visit early in the morning or late in the afternoon when the sunlight is soft and perfect for sightseeing.";
    if (main.includes("rain"))
      return "Consider visiting during the afternoon when the rain is lighter, or enjoy indoor attractions like museums and cozy cafes.";
    if (main.includes("cloud"))
      return "Cloudy days are great for exploring local culture and indoor activities while still enjoying the city's vibe.";
    if (main.includes("snow"))
      return "If it's snowy, midday offers milder conditions ideal for winter sports and enjoying seasonal festivals.";
    return "Every season has its own charm. Check local guides for the best time to visit.";
  };

  return (
    <div
      className="weather-container"
      style={{
        background: getBackgroundByWeather(),
        backgroundSize: "400% 400%",
        animation: "moveWind 30s linear infinite",
        color: darkMode ? "#CCCCCC" : "#333333",
      }}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mode-toggle"
        style={{
          backgroundColor: darkMode ? "#6B7C85" : "#FFE4B5",
          color: darkMode ? "#CCCCCC" : "#333333",
        }}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <Player
        src="/models/animation.json"
        loop
        autoplay
        style={{ height: "200px", marginBottom: "20px" }}
      />

      <h2 style={{ animation: "fadeIn 1s" }}>Weather Checker</h2>
      
      <DecryptedText
        text="Welcome to Weather Checker! Enter your city name to get real-time weather information and personalized travel tips for your destination."
        animateOn="view"
        revealDirection="center"
      />

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchCitySuggestions(e.target.value);
          }}
        />
        <button onClick={fetchWeather}>Check</button>
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setCity(suggestion.split(",")[0]);
                  setSuggestions([]);
                  fetchWeather();
                }}
              >
                📍 {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {weather && (
        <>
          <div className="weather-info">
            <h3>{weather.name}</h3>
            <p>
              🌡 Temperature: {weather.main.temp}°{unit === "metric" ? "C" : "F"}
            </p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>
              💨 Wind Speed: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
            </p>
            <p>☁ Condition: {weather.weather[0].description}</p>
            <p>📈 Pressure: {weather.main.pressure} hPa</p>
            <p>👁 Visibility: {weather.visibility / 1000} km</p>
            <p>
              🌡 Feels Like: {weather.main.feels_like}°{unit === "metric" ? "C" : "F"}
            </p>
            <p>🕒 Local Time: {formatLocalTime(weather.timezone)}</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <button className="unit-toggle" onClick={handleUnitChange}>
              Switch to {unit === "metric" ? "Fahrenheit" : "Celsius"}
            </button>
          </div>

          <div className="travel-recommendations">
            <h4>Travel Recommendations</h4>
            <p>{getTravelRecommendation()}</p>
            <p>
              Whether you're planning a quick getaway or a longer trip, consider exploring local attractions, dining at popular eateries, and immersing yourself in the culture. Check local event listings to enhance your experience.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherPage;
