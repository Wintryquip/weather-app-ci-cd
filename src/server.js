const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const PORT = 3000;

const API_KEY = process.env.API_KEY;

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/result", async (req, res) => {
    const city = req.query.city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const temperature = (data.main.temp - 273.15).toFixed(1);
        const feelsLike = (data.main.feels_like - 273.15).toFixed(1);
        const description = data.weather[0].description;
        const pressure = data.main.pressure;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const windDeg = data.wind.deg;
        const rain = data.rain ? `${data.rain["1h"]} mm/h` : "Brak";
        const clouds = data.clouds.all;
        const visibility = data.visibility / 1000 + " km";

        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("pl-PL");
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("pl-PL");

        res.send(`
            <h1>Pogoda w ${data.name} (${data.sys.country})</h1>
            <ul>
                <li><strong>Opis:</strong> ${description}</li>
                <li><strong>Temperatura:</strong> ${temperature}°C (odczuwalna: ${feelsLike}°C)</li>
                <li><strong>Min / Max:</strong> ${(data.main.temp_min - 273.15).toFixed(1)}°C / ${(data.main.temp_max - 273.15).toFixed(1)}°C</li>
                <li><strong>Ciśnienie:</strong> ${pressure} hPa</li>
                <li><strong>Wilgotność:</strong> ${humidity}%</li>
                <li><strong>Wiatr:</strong> ${windSpeed} m/s, kierunek: ${windDeg}°</li>
                <li><strong>Opady deszczu (1h):</strong> ${rain}</li>
                <li><strong>Zachmurzenie:</strong> ${clouds}%</li>
                <li><strong>Widoczność:</strong> ${visibility}</li>
                <li><strong>Wschód słońca:</strong> ${sunrise}</li>
                <li><strong>Zachód słońca:</strong> ${sunset}</li>
            </ul>
        `);
    } catch (error) {
        console.error("Błąd w poborze danych: ", error);
        res.status(500).send("Błąd poboru danych.");
    }
});

app.listen(PORT, () => {
    const now = new Date();
    console.log(now.toString());
    console.log("Autor: Mateusz Kędra")
    console.log("Serwer nasłuchuje na porcie " + PORT);
});