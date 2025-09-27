# Weather App

A fully functional, modern weather application built with HTML, CSS, and JavaScript. Features real-time weather data, 5-day forecasts, geolocation support, and a beautiful responsive design.

## ✨ Features

- 🌤️ **Current Weather Display** - Real-time weather conditions with detailed information
- 📅 **5-Day Forecast** - Extended weather predictions with daily highs and lows
- 📍 **Geolocation Support** - Automatic weather detection for your current location
- 🔍 **City Search** - Search for weather in any city worldwide
- ⭐ **Favorites Management** - Save and quickly access your favorite cities
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🌙 **Dark Mode Support** - Automatic dark mode based on system preferences
- 🌡️ **Temperature Units** - Toggle between Celsius and Fahrenheit
- 💾 **Local Storage** - Remembers your favorites and recent searches
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations

## 🚀 Quick Start

1. **Clone or download** the weather app files to your local machine
2. **Navigate** to the weather-app directory
3. **Start a local server**:
   ```bash
   # Using Python (recommended)
   python3 -m http.server 8080
   
   # Or using Node.js
   npx serve .
   
   # Or using PHP
   php -S localhost:8080
   ```
4. **Open your browser** and visit `http://localhost:8080`

## 📁 Project Structure

```
weather-app/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styles and animations
├── script.js           # JavaScript functionality
├── package.json        # Project configuration
└── README.md          # This file
```

## 🔧 Usage

### Basic Weather Search
1. Enter a city name in the search box
2. Click the search button or press Enter
3. View current weather and 5-day forecast

### Current Location Weather
1. Click the location button (📍)
2. Allow location access when prompted
3. View weather for your current location

### Managing Favorites
1. Search for a city's weather
2. Click the heart icon (♡) to add to favorites
3. Click on any favorite city to quickly view its weather
4. Remove favorites by clicking the ✕ button

### Temperature Units
- Toggle between Celsius (°C) and Fahrenheit (°F) using the buttons in the weather display
- Your preference is automatically saved

## 🛠️ Customization

### Adding Real Weather API

To connect to a real weather API (like OpenWeatherMap):

1. **Get an API key** from [OpenWeatherMap](https://openweathermap.org/api)
2. **Update the API key** in `script.js`:
   ```javascript
   this.apiKey = 'your_actual_api_key_here';
   ```
3. **Uncomment the API code** in the `fetchWeatherData()` and `fetchWeatherDataByCoords()` methods
4. **Comment out or remove** the mock data methods

### Styling Customization

The app uses CSS custom properties for easy theming. Key variables are defined in `styles.css`:

- Colors: Modify the gradient backgrounds and accent colors
- Fonts: Change the font family imports in the HTML head
- Animations: Adjust timing and effects in the CSS animations

### Adding New Features

The modular JavaScript structure makes it easy to add features:

- **Historical Weather**: Add methods to fetch and display past weather data
- **Weather Maps**: Integrate weather map overlays
- **Alerts**: Add severe weather notifications
- **More Details**: Include sunrise/sunset times, moon phases, etc.

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

**Required Features:**
- Geolocation API (for location-based weather)
- Local Storage (for favorites and recent searches)
- Fetch API (for weather data requests)

## 📱 Mobile Experience

The app is fully responsive and provides an excellent mobile experience:

- Touch-friendly interface
- Optimized layouts for small screens
- Fast loading times
- Smooth animations

## 🔒 Privacy

- **No personal data collection**: The app only uses your location when explicitly requested
- **Local storage only**: All favorites and preferences are stored locally in your browser
- **No tracking**: No analytics or tracking scripts are included

## 🐛 Troubleshooting

### Common Issues

**Weather data not loading:**
- Check your internet connection
- Ensure the API key is valid (if using real API)
- Verify the city name spelling

**Location not working:**
- Allow location permissions in your browser
- Ensure you're using HTTPS (required for geolocation)
- Check if location services are enabled

**App not displaying correctly:**
- Clear your browser cache
- Ensure JavaScript is enabled
- Try a different browser

## 🤝 Contributing

Feel free to contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Weather icons provided by [OpenWeatherMap](https://openweathermap.org/)
- Font icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

**Enjoy using your new weather app! 🌈**

For questions or support, please open an issue in the project repository.