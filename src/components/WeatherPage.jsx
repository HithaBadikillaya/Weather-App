import React, { useState, useEffect } from "react";
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [moodMessage, setMoodMessage] = useState("");
  const [surprise, setSurprise] = useState("");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchWeather = async (selectedUnit = unit) => {
    if (!city.trim()) return;
    setError("");
    setWeather(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=${selectedUnit}`
      );
      setWeather(response.data);
      setMoodMessage("");
      setSurprise("");
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError("City not found or API error. Please check your input.");
      setWeather(null);
    }
  };

  const fetchCitySuggestions = async (query) => {
    if (!query.trim()) return;
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query.trim()}&limit=5&appid=${API_KEY}`
      );
      if (response.data.length > 0) {
        const validSuggestions = response.data
          .filter(
            (item) =>
              item.name &&
              item.country &&
              /^[a-zA-Z\s]+$/.test(item.name)
          )
          .map((item) => ({
            name: item.name,
            country: item.country,
          }));
        if (validSuggestions.length === 0) {
          setSuggestions([]);
          setError("No valid suggestions available. Please refine your search.");
        } else {
          setSuggestions(validSuggestions);
        }
      } else {
        setSuggestions([]);
        setError("No valid suggestions available. Please refine your search.");
      }
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
    }
  };

  useEffect(() => {
    if (city.trim()) {
      fetchWeather(unit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const handleUnitChange = () => {
    setUnit(unit === "metric" ? "imperial" : "metric");
  };

  const getBackgroundByWeather = () => {
    if (!darkMode) {
      return "linear-gradient(135deg, #AEDFF7, #FFE4B5, #FFFFFF, #DCDCDC)";
    }
    if (!weather) {
      return "linear-gradient(135deg, #2F3E46, #3A4E56, #2B3B43, #6B7C85)";
    }
    const mainWeather = weather.weather[0].main.toLowerCase();
    if (mainWeather.includes("rain"))
      return "linear-gradient(135deg, #384B57, #2F3E46)";
    if (mainWeather.includes("clear"))
      return "linear-gradient(135deg, #2F3E46, #1B2A31)";
    if (mainWeather.includes("snow"))
      return "linear-gradient(135deg, #3A4E56, #2B3B43)";
    if (mainWeather.includes("cloud"))
      return "linear-gradient(135deg, #3A4E56, #2F3E46)";
    return "linear-gradient(135deg, #2F3E46, #3A4E56, #2B3B43, #6B7C85)";
  };

  const formatLocalTime = (timezoneOffset) => {
    const localTime = new Date(Date.now() + timezoneOffset * 1000);
    return localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleMoodSelection = (mood) => {
    let message = "";
    switch (mood) {
      case "happy":
        message = "Yay! Your positive vibe makes this day even brighter!";
        break;
      case "sad":
        message = "Even on gloomy days, a little smile can light up your world.";
        break;
      case "excited":
        message = "Your excitement is contagious—go out and enjoy every moment!";
        break;
      case "chill":
        message = "Perfectly chill! Relax and let the calm vibes take over.";
        break;
      default:
        message = "";
    }
    setMoodMessage(message);
  };

  const handleSurprise = () => {
    setSurprise("https://media.tenor.com/kGekz062mwgAAAAM/hugs-rickroll.gif");
  };

  return (
    <div
      className="weather-container"
      style={{
        background: getBackgroundByWeather(),
        backgroundSize: "400% 400%",
        animation: "moveWind 30s linear infinite",
        color: darkMode ? "#CCCCCC" : "#333333"
      }}
    >
      {!isOnline && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ffcccc",
            color: "#990000",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 1000,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          Please check your internet connection
        </div>
      )}

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mode-toggle"
        style={{
          backgroundColor: darkMode ? "#6B7C85" : "#FFE4B5",
          color: darkMode ? "#CCCCCC" : "#333333"
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
        text="Welcome to Weather Checker! Enter your city name to get real-time weather information."
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
        <button
          onClick={() => {
            setSuggestions([]);
            fetchWeather(unit);
          }}
        >
          Check
        </button>
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((item, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setCity(item.name);
                  setSuggestions([]);
                  fetchWeather(unit);
                }}
              >
                {item.name}, {item.country}
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
              💨 Wind Speed: {weather.wind.speed}
              {unit === "metric" ? " m/s" : " mph"}
            </p>
            <p>☁ Condition: {weather.weather[0].description}</p>
            <p>📈 Pressure: {weather.main.pressure} hPa</p>
            <p>👁 Visibility: {weather.visibility / 1000} km</p>
            <p>
              🌡 Feels Like: {weather.main.feels_like}°{unit === "metric" ? "C" : "F"}
            </p>
            <p>🕒 Local Time: {formatLocalTime(weather.timezone)}</p>
            {weather.sys && (
              <>
                <p>🌅 Sunrise: {formatTime(weather.sys.sunrise)}</p>
                <p>🌇 Sunset: {formatTime(weather.sys.sunset)}</p>
              </>
            )}
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <button className="unit-toggle" onClick={handleUnitChange}>
              Switch to {unit === "metric" ? "Fahrenheit" : "Celsius"}
            </button>
          </div>

          <div className="weather-info" style={{ marginTop: "20px" }}>
            <h3>Weather Fun Zone</h3>
            <p>How does the weather make you feel?</p>
            <div style={{ display: "flex", gap: "30px", marginTop: "10px" }}>
              <button onClick={() => handleMoodSelection("happy")}>
                <img
                  src="https://media.tenor.com/r-O2xbfTEWIAAAAm/bear-dance-no-background.webp"
                  width={100}
                  alt="happy"
                />
              </button>
              <button onClick={() => handleMoodSelection("sad")}>
                <img
                  src="https://media.tenor.com/sWXhCC4A2woAAAAm/bubu-bubu-dudu.webp"
                  width={100}
                  alt="sad"
                />
              </button>
              <button onClick={() => handleMoodSelection("excited")}>
                <img
                  src="https://media.tenor.com/43q8XEc3ns4AAAAm/dudu-flapping-dudu-cheeky.webp"
                  width={100}
                  alt="excited"
                />
              </button>
              <button onClick={() => handleMoodSelection("chill")}>
                <img
                  src="https://media.tenor.com/ue2ZWNR01AoAAAAm/bubu-yier.webp"
                  width={100}
                  alt="chill"
                />
              </button>
            </div>
            {moodMessage && <p style={{ marginTop: "10px" }}>{moodMessage}</p>}
          </div>

          <div className="weather-info" style={{ marginTop: "20px", textAlign: "center" }}>
            <h3>Surprise!</h3>
            <button
              onClick={handleSurprise}
              style={{ marginTop: "10px", padding: "8px 12px" }}
            >
              Click for a Surprise
            </button>
            {surprise && (
              <div style={{ marginTop: "10px" }}>
                <img src={surprise} alt="Surprise Gif" style={{ maxWidth: "100%" }} />
                <p style={{ fontSize: "2em" }}>Have a nice day!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherPage;
