// Weather App JavaScript

class WeatherApp {
    constructor() {
        // Load configuration
        this.config = window.CONFIG || {};
        this.apiKey = this.config.API_KEY || 'demo';
        this.apiBaseUrl = this.config.API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
        this.useDemoData = this.config.USE_DEMO_DATA !== false;
        
        this.currentUnit = this.config.DEFAULT_UNIT || 'metric';
        this.favorites = this.loadFavorites();
        this.recentSearches = this.loadRecentSearches();
        
        this.initializeElements();
        this.bindEvents();
        this.displayFavorites();
        this.displayRecentSearches();
        
        // Try to get user's location on load
        this.getCurrentLocationWeather();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        this.currentWeather = document.getElementById('currentWeather');
        this.forecast = document.getElementById('forecast');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.favoritesList = document.getElementById('favoritesList');
        this.recentList = document.getElementById('recentList');
        
        // Weather data elements
        this.cityName = document.getElementById('cityName');
        this.dateTime = document.getElementById('dateTime');
        this.currentTemp = document.getElementById('currentTemp');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherDesc = document.getElementById('weatherDesc');
        this.feelsLike = document.getElementById('feelsLike');
        this.visibility = document.getElementById('visibility');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.uvIndex = document.getElementById('uvIndex');
        this.airQuality = document.getElementById('airQuality');
        this.forecastList = document.getElementById('forecastList');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        this.locationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        
        // Temperature unit toggle
        document.getElementById('celsiusBtn').addEventListener('click', () => {
            if (this.currentUnit !== 'metric') {
                this.currentUnit = 'metric';
                document.getElementById('celsiusBtn').classList.add('active');
                document.getElementById('fahrenheitBtn').classList.remove('active');
                this.updateTemperatureDisplay();
            }
        });
        
        document.getElementById('fahrenheitBtn').addEventListener('click', () => {
            if (this.currentUnit !== 'imperial') {
                this.currentUnit = 'imperial';
                document.getElementById('fahrenheitBtn').classList.add('active');
                document.getElementById('celsiusBtn').classList.remove('active');
                this.updateTemperatureDisplay();
            }
        });
    }

    showLoading() {
        this.loading.classList.remove('hidden');
        this.error.classList.add('hidden');
        this.currentWeather.classList.add('hidden');
        this.forecast.classList.add('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        this.errorMessage.textContent = message;
        this.error.classList.remove('hidden');
        this.currentWeather.classList.add('hidden');
        this.forecast.classList.add('hidden');
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        this.showLoading();
        
        try {
            const weatherData = await this.fetchWeatherData(city);
            this.displayWeatherData(weatherData);
            this.addToRecentSearches(city);
            this.cityInput.value = '';
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError('Unable to fetch weather data. Please try again.');
        }
    }

    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const weatherData = await this.fetchWeatherDataByCoords(latitude, longitude);
                    this.displayWeatherData(weatherData);
                } catch (error) {
                    console.error('Error fetching weather by location:', error);
                    this.showError('Unable to fetch weather for your location');
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                this.showError('Unable to access your location. Please search for a city manually.');
            }
        );
    }

    async fetchWeatherData(city) {
        // For production use, uncomment this and add your API key:
        /*
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const currentData = await response.json();
            
            // Fetch 5-day forecast
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`
            );
            
            const forecastData = await forecastResponse.json();
            
            return {
                current: currentData,
                forecast: forecastData,
                uv: Math.random() * 10, // Would need separate UV API call
                airQuality: Math.floor(Math.random() * 5) + 1 // Would need separate AQI API call
            };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
        */
        
        // Using enhanced mock data for demo
        return this.generateRealisticWeather(city);
    }

    async fetchWeatherDataByCoords(lat, lon) {
        // For production use, uncomment this and add your API key:
        /*
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const currentData = await response.json();
            
            // Fetch 5-day forecast
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );
            
            const forecastData = await forecastResponse.json();
            
            return {
                current: currentData,
                forecast: forecastData,
                uv: Math.random() * 10,
                airQuality: Math.floor(Math.random() * 5) + 1
            };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
        */
        
        // Mock implementation for coordinates
        return this.generateRealisticWeather('Your Location', lat, lon);
    }

    // Mock weather data for demonstration
    getMockWeatherData(city, lat = null, lon = null) {
        const weatherConditions = [
            { main: 'Clear', description: 'clear sky', icon: '01d' },
            { main: 'Clouds', description: 'few clouds', icon: '02d' },
            { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
            { main: 'Rain', description: 'light rain', icon: '10d' },
            { main: 'Snow', description: 'light snow', icon: '13d' }
        ];

        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const baseTemp = Math.floor(Math.random() * 35) - 5; // -5 to 30°C

        const currentWeather = {
            name: city,
            coord: { lat: lat || (Math.random() * 180 - 90), lon: lon || (Math.random() * 360 - 180) },
            weather: [randomCondition],
            main: {
                temp: baseTemp,
                feels_like: baseTemp + (Math.random() * 6 - 3),
                humidity: Math.floor(Math.random() * 40) + 40,
                pressure: Math.floor(Math.random() * 50) + 1000
            },
            visibility: Math.floor(Math.random() * 10000) + 5000,
            wind: {
                speed: Math.random() * 20,
                deg: Math.floor(Math.random() * 360)
            },
            dt: Date.now() / 1000
        };

        // Generate 5-day forecast
        const forecast = [];
        for (let i = 1; i <= 5; i++) {
            const forecastCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
            const dayTemp = baseTemp + (Math.random() * 10 - 5);
            
            forecast.push({
                dt: (Date.now() / 1000) + (i * 24 * 60 * 60),
                weather: [forecastCondition],
                main: {
                    temp_max: dayTemp + Math.random() * 5,
                    temp_min: dayTemp - Math.random() * 5
                }
            });
        }

        return {
            current: currentWeather,
            forecast: { list: forecast },
            uv: Math.random() * 10,
            airQuality: Math.floor(Math.random() * 5) + 1
        };
    }

    displayWeatherData(data) {
        this.hideLoading();
        this.error.classList.add('hidden');
        
        const { current, forecast, uv, airQuality } = data;
        this.currentWeatherData = current;
        this.currentForecastData = forecast;
        this.currentUvData = uv;
        this.currentAirQuality = airQuality;

        // Update current weather
        this.cityName.textContent = current.name;
        this.dateTime.textContent = this.formatDateTime(current.dt);
        
        const displayTemp = this.currentUnit === 'metric' 
            ? current.main.temp 
            : this.convertTemp(current.main.temp);
        const displayFeelsLike = this.currentUnit === 'metric'
            ? current.main.feels_like
            : this.convertTemp(current.main.feels_like);
            
        this.currentTemp.textContent = Math.round(displayTemp);
        this.weatherIcon.src = this.getWeatherIconUrl(current.weather[0].icon);
        this.weatherIcon.alt = current.weather[0].description;
        this.weatherDesc.textContent = current.weather[0].description;
        this.feelsLike.querySelector('span').textContent = `${Math.round(displayFeelsLike)}${this.getUnitSymbol()}`;
        
        // Update weather details
        this.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
        this.humidity.textContent = `${current.main.humidity}%`;
        this.windSpeed.textContent = `${current.wind.speed.toFixed(1)} km/h`;
        this.pressure.textContent = `${current.main.pressure} hPa`;
        this.uvIndex.textContent = uv ? uv.toFixed(1) : 'N/A';
        this.airQuality.textContent = this.getAirQualityText(airQuality);

        // Update temperature unit display
        const tempUnit = document.querySelector('.temp-unit');
        if (tempUnit) {
            tempUnit.textContent = this.getUnitSymbol();
        }

        // Update favorite button state
        this.updateFavoriteButton();

        // Display current weather and forecast
        this.currentWeather.classList.remove('hidden');
        this.displayForecast(forecast.list);
    }

    displayForecast(forecastData) {
        this.forecastList.innerHTML = '';
        
        forecastData.slice(0, 5).forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-icon">
                    <img src="${this.getWeatherIconUrl(item.weather[0].icon)}" alt="${item.weather[0].description}">
                </div>
                <div class="forecast-desc">${item.weather[0].description}</div>
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(item.main.temp_max)}°</span>
                    <span class="forecast-low">${Math.round(item.main.temp_min)}°</span>
                </div>
            `;
            
            this.forecastList.appendChild(forecastItem);
        });
        
        this.forecast.classList.remove('hidden');
    }

    getWeatherIconUrl(iconCode) {
        // Using OpenWeatherMap icons
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    formatDateTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getAirQualityText(index) {
        const qualities = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
        return qualities[index - 1] || 'N/A';
    }

    // Favorites Management
    toggleFavorite() {
        if (!this.currentWeatherData) return;

        const cityName = this.currentWeatherData.name;
        const isFavorite = this.favorites.some(fav => fav.name === cityName);

        if (isFavorite) {
            this.favorites = this.favorites.filter(fav => fav.name !== cityName);
            this.favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            this.favoriteBtn.classList.remove('active');
        } else {
            const favoriteData = {
                name: cityName,
                temp: Math.round(this.currentWeatherData.main.temp),
                icon: this.currentWeatherData.weather[0].icon,
                description: this.currentWeatherData.weather[0].description,
                coords: this.currentWeatherData.coord
            };
            this.favorites.push(favoriteData);
            this.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
            this.favoriteBtn.classList.add('active');
        }

        this.saveFavorites();
        this.displayFavorites();
    }

    updateFavoriteButton() {
        if (!this.currentWeatherData) return;

        const cityName = this.currentWeatherData.name;
        const isFavorite = this.favorites.some(fav => fav.name === cityName);

        if (isFavorite) {
            this.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
            this.favoriteBtn.classList.add('active');
        } else {
            this.favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            this.favoriteBtn.classList.remove('active');
        }
    }

    displayFavorites() {
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = '<p class="no-favorites">No favorite cities yet. Add some by clicking the heart icon!</p>';
            return;
        }

        this.favoritesList.innerHTML = '';
        this.favorites.forEach(favorite => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.innerHTML = `
                <div class="favorite-info">
                    <div class="favorite-name">${favorite.name}</div>
                    <div class="favorite-temp">${favorite.temp}°C - ${favorite.description}</div>
                </div>
                <button class="remove-favorite" onclick="weatherApp.removeFavorite('${favorite.name}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            favoriteItem.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-favorite')) {
                    this.searchWeatherByName(favorite.name);
                }
            });
            
            this.favoritesList.appendChild(favoriteItem);
        });
    }

    removeFavorite(cityName) {
        this.favorites = this.favorites.filter(fav => fav.name !== cityName);
        this.saveFavorites();
        this.displayFavorites();
        this.updateFavoriteButton();
    }

    // Recent Searches Management
    addToRecentSearches(city) {
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(search => search.name !== city);
        
        // Add to beginning
        this.recentSearches.unshift({
            name: city,
            timestamp: Date.now()
        });
        
        // Keep only last 5 searches
        this.recentSearches = this.recentSearches.slice(0, 5);
        
        this.saveRecentSearches();
        this.displayRecentSearches();
    }

    displayRecentSearches() {
        if (this.recentSearches.length === 0) {
            this.recentList.innerHTML = '<p class="no-recent">No recent searches yet.</p>';
            return;
        }

        this.recentList.innerHTML = '';
        this.recentSearches.forEach(search => {
            const recentItem = document.createElement('div');
            recentItem.className = 'recent-item';
            recentItem.innerHTML = `
                <div class="recent-info">
                    <div class="recent-name">${search.name}</div>
                    <div class="recent-time">${this.formatRelativeTime(search.timestamp)}</div>
                </div>
            `;
            
            recentItem.addEventListener('click', () => {
                this.searchWeatherByName(search.name);
            });
            
            this.recentList.appendChild(recentItem);
        });
    }

    async searchWeatherByName(cityName) {
        this.cityInput.value = cityName;
        await this.searchWeather();
    }

    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    // Local Storage Management
    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('weatherApp_favorites') || '[]');
        } catch {
            return [];
        }
    }

    saveFavorites() {
        localStorage.setItem('weatherApp_favorites', JSON.stringify(this.favorites));
    }

    loadRecentSearches() {
        try {
            return JSON.parse(localStorage.getItem('weatherApp_recent') || '[]');
        } catch {
            return [];
        }
    }

    saveRecentSearches() {
        localStorage.setItem('weatherApp_recent', JSON.stringify(this.recentSearches));
    }

    // Temperature Unit Conversion
    toggleUnit() {
        this.currentUnit = this.currentUnit === 'metric' ? 'imperial' : 'metric';
        if (this.currentWeatherData) {
            this.displayWeatherData({
                current: this.currentWeatherData,
                forecast: this.currentForecastData,
                uv: this.currentUvData,
                airQuality: this.currentAirQuality
            });
        }
    }

    convertTemp(temp, fromUnit = 'metric') {
        if (this.currentUnit === fromUnit) return temp;
        
        if (this.currentUnit === 'imperial') {
            // Convert Celsius to Fahrenheit
            return (temp * 9/5) + 32;
        } else {
            // Convert Fahrenheit to Celsius
            return (temp - 32) * 5/9;
        }
    }

    getUnitSymbol() {
        return this.currentUnit === 'metric' ? '°C' : '°F';
    }

    // Demo functionality with realistic weather patterns
    generateRealisticWeather(city, lat = null, lon = null) {
        const cities = {
            'london': { baseTemp: 12, humidity: 75, conditions: ['Clouds', 'Rain'] },
            'new york': { baseTemp: 18, humidity: 65, conditions: ['Clear', 'Clouds'] },
            'tokyo': { baseTemp: 22, humidity: 70, conditions: ['Clear', 'Clouds', 'Rain'] },
            'paris': { baseTemp: 15, humidity: 68, conditions: ['Clouds', 'Clear'] },
            'sydney': { baseTemp: 25, humidity: 60, conditions: ['Clear', 'Clouds'] },
            'moscow': { baseTemp: 5, humidity: 80, conditions: ['Snow', 'Clouds'] },
            'dubai': { baseTemp: 35, humidity: 45, conditions: ['Clear'] },
            'mumbai': { baseTemp: 30, humidity: 85, conditions: ['Rain', 'Clouds'] },
            'your location': { baseTemp: 22, humidity: 65, conditions: ['Clear', 'Clouds'] }
        };

        const cityKey = city.toLowerCase();
        const cityData = cities[cityKey] || { baseTemp: 20, humidity: 60, conditions: ['Clear', 'Clouds'] };
        
        const condition = cityData.conditions[Math.floor(Math.random() * cityData.conditions.length)];
        const temp = cityData.baseTemp + (Math.random() * 10 - 5);

        // Generate realistic forecast data
        const forecastList = [];
        for (let i = 1; i <= 5; i++) {
            const forecastCondition = cityData.conditions[Math.floor(Math.random() * cityData.conditions.length)];
            const dayTemp = temp + (Math.random() * 8 - 4);
            
            forecastList.push({
                dt: (Date.now() / 1000) + (i * 24 * 60 * 60),
                weather: [{
                    main: forecastCondition,
                    description: this.getWeatherDescription(forecastCondition),
                    icon: this.getWeatherIcon(forecastCondition)
                }],
                main: {
                    temp_max: dayTemp + Math.random() * 5,
                    temp_min: dayTemp - Math.random() * 5
                }
            });
        }

        return {
            current: {
                name: city,
                coord: { 
                    lat: lat || (Math.random() * 180 - 90), 
                    lon: lon || (Math.random() * 360 - 180) 
                },
                weather: [{
                    main: condition,
                    description: this.getWeatherDescription(condition),
                    icon: this.getWeatherIcon(condition)
                }],
                main: {
                    temp: temp,
                    feels_like: temp + (Math.random() * 4 - 2),
                    humidity: Math.max(20, Math.min(95, cityData.humidity + (Math.random() * 20 - 10))),
                    pressure: 1013 + (Math.random() * 30 - 15)
                },
                visibility: Math.floor(Math.random() * 10000) + 5000,
                wind: {
                    speed: Math.random() * 20,
                    deg: Math.floor(Math.random() * 360)
                },
                dt: Date.now() / 1000
            },
            forecast: { list: forecastList },
            uv: Math.random() * 10,
            airQuality: Math.floor(Math.random() * 5) + 1
        };
    }

    getWeatherDescription(condition) {
        const descriptions = {
            'Clear': 'clear sky',
            'Clouds': Math.random() > 0.5 ? 'few clouds' : 'scattered clouds',
            'Rain': Math.random() > 0.5 ? 'light rain' : 'moderate rain',
            'Snow': 'light snow',
            'Thunderstorm': 'thunderstorm'
        };
        return descriptions[condition] || 'clear sky';
    }

    getWeatherIcon(condition) {
        const icons = {
            'Clear': '01d',
            'Clouds': Math.random() > 0.5 ? '02d' : '03d',
            'Rain': '10d',
            'Snow': '13d',
            'Thunderstorm': '11d'
        };
        return icons[condition] || '01d';
    }

    // Update temperature display when unit changes
    updateTemperatureDisplay() {
        if (!this.currentWeatherData) return;
        
        const temp = this.currentUnit === 'metric' 
            ? this.currentWeatherData.main.temp 
            : this.convertTemp(this.currentWeatherData.main.temp);
        
        const feelsLike = this.currentUnit === 'metric'
            ? this.currentWeatherData.main.feels_like
            : this.convertTemp(this.currentWeatherData.main.feels_like);
        
        this.currentTemp.textContent = Math.round(temp);
        this.feelsLike.querySelector('span').textContent = `${Math.round(feelsLike)}${this.getUnitSymbol()}`;
        
        // Update temperature unit display
        const tempUnit = document.querySelector('.temp-unit');
        if (tempUnit) {
            tempUnit.textContent = this.getUnitSymbol();
        }
        
        // Update forecast temperatures
        const forecastItems = document.querySelectorAll('.forecast-item');
        if (this.currentForecastData) {
            forecastItems.forEach((item, index) => {
                if (this.currentForecastData.list[index]) {
                    const highTemp = this.currentUnit === 'metric'
                        ? this.currentForecastData.list[index].main.temp_max
                        : this.convertTemp(this.currentForecastData.list[index].main.temp_max);
                    
                    const lowTemp = this.currentUnit === 'metric'
                        ? this.currentForecastData.list[index].main.temp_min
                        : this.convertTemp(this.currentForecastData.list[index].main.temp_min);
                    
                    const highSpan = item.querySelector('.forecast-high');
                    const lowSpan = item.querySelector('.forecast-low');
                    
                    if (highSpan) highSpan.textContent = `${Math.round(highTemp)}°`;
                    if (lowSpan) lowSpan.textContent = `${Math.round(lowTemp)}°`;
                }
            });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});