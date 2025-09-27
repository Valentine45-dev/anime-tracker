// Weather App Configuration
// To use a real weather API, get a free API key from https://openweathermap.org/api
// and replace 'demo' with your actual API key

const CONFIG = {
    // OpenWeatherMap API Configuration
    API_KEY: 'demo', // Replace with your actual API key
    API_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    
    // App Settings
    DEFAULT_UNIT: 'metric', // 'metric' for Celsius, 'imperial' for Fahrenheit
    MAX_RECENT_SEARCHES: 5,
    MAX_FAVORITES: 10,
    
    // Demo Mode
    USE_DEMO_DATA: true, // Set to false when using real API
    
    // UI Settings
    ANIMATION_DURATION: 600, // milliseconds
    AUTO_REFRESH_INTERVAL: 300000, // 5 minutes in milliseconds
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}