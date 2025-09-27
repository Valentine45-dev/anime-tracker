# SkyCast – Weather App

SkyCast is a fast, dependency-free weather web app powered by the Open‑Meteo Forecast and Geocoding APIs.

## Features

- Current conditions with emoji icon, feels-like, humidity, wind, and precipitation
- Next 24 hours forecast (scrollable)
- 7‑day forecast
- City search with live suggestions
- Geolocation detection with graceful fallback
- Units toggle (°C/°F) with persistence
- Local caching (10 min) and last‑updated timestamp

## Run locally

Any static file server works. Examples:

```bash
# Python
python3 -m http.server 5173 -d /workspace/weather-app

# Node (if installed)
npx serve -s /workspace/weather-app -l 5173 --yes
```

Then open `http://localhost:5173`.

## Attribution

- Weather and geocoding data: [Open‑Meteo](https://open-meteo.com/)

## Notes

- No build step, pure HTML/CSS/JS. Works offline after first load for cached locations (data expires after 10 minutes).
