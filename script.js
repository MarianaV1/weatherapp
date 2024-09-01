// script.js

const apiKey = '3PD26FM6YN2AM9CKX5SYRBKEB';

async function getWeatherData(location) {
    const endpoint = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${apiKey}&contentType=json`;
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        
        const data = await response.json();
        console.log(data); // Log the full JSON data to see what it looks like
        return data;
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
    }
}
function processWeatherData(data) {
    const { address, currentConditions, days } = data;
    
    // Extract current weather information
    const processedData = {
        location: address,
        temperature: currentConditions.temp,
        conditions: currentConditions.conditions,
        windSpeed: currentConditions.windspeed,
    };

    // Extract a 7-day forecast
    const weekForecast = days.slice(0, 7).map(day => ({
        date: day.datetime,
        tempMax: day.tempmax,
        tempMin: day.tempmin,
        conditions: day.conditions
    }));
    
    processedData.weekForecast = weekForecast;
    
    console.log(processedData); // Log the processed data
    return processedData;
}

document.getElementById('location-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const location = document.getElementById('location-input').value;
    const weatherData = await getWeatherData(location);
    const processedData = processWeatherData(weatherData);
    
    displayWeather(processedData);
});

async function displayWeather(data) {
    const weatherDisplay = document.getElementById('weather-display');
    
    // Fetch a GIF related to the current weather conditions
    const gifUrl = await getWeatherGif(data.conditions);
    
    // Display current weather
    const currentWeatherHtml = `
        <h2>Weather in ${data.location}</h2>
        <p>Temperature: ${data.temperature}°C</p>
        <p class="cond">${data.conditions}</p>
        <img src="${gifUrl}" alt="${data.conditions} GIF" class="weather-gif">
    `;
    
    // Display weekly forecast horizontally with weekday names and icons
    const forecastHtml = data.weekForecast.map(day => {
        const date = new Date(day.date);
        const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const iconClass = getWeatherIcon(day.conditions);
        
        return `
            <div class="forecast-day">
                <h3>${weekdayName}</h3>
                <i class="wi ${iconClass}"></i>
                <p>${date.toLocaleDateString('en-US')}</p>
                <p>High: ${day.tempMax}°C</p>
                <p>Low: ${day.tempMin}°C</p>
                <p>Conditions: ${day.conditions}</p>
            </div>
        `;
    }).join('');
    
    weatherDisplay.innerHTML = currentWeatherHtml + '<h3>7-Day Forecast</h3><div class="forecast-container">' + forecastHtml + '</div>';
}



const giphyApiKey = 'Jxl3qrgOv9XOY0CeR8avXIPcdLqOe5DL';

async function getWeatherGif(conditions) {
    const endpoint = `https://api.giphy.com/v1/gifs/translate?api_key=${giphyApiKey}&s=${encodeURIComponent(conditions)}`;
    
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        
        const data = await response.json();
        console.log(data); // Log the GIF data
        return data.data.images.original.url; // Return the GIF URL
    } catch (error) {
        console.error('Failed to fetch GIF:', error);
    }
}

function getWeatherIcon(conditions) {
    const conditionMap = {
        'Clear': 'wi-day-sunny',
        'Partially cloudy': 'wi-day-cloudy',
        'Cloudy': 'wi-cloudy',
        'Rain': 'wi-rain',
        'Thunderstorm': 'wi-thunderstorm',
        'Snow': 'wi-snow',
        'Fog': 'wi-fog',
        'Wind': 'wi-strong-wind',
        'Rain, Partially cloudy': 'wi-day-cloudy',
        'Rain, Overcast': 'wi-fog'
    };

    // Find the appropriate icon class
    return conditionMap[conditions] || 'wi-na'; // Default to 'na' icon if not found
}

