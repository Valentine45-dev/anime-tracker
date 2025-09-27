'use strict';

// SkyCast - a simple, dependency-free weather app using Open-Meteo APIs

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

/**
 * Units configuration for API and formatting.
 */
const UNITS = {
  metric: {
    label: 'metric',
    temperatureUnit: 'celsius',
    windSpeedUnit: 'kmh',
    precipitationUnit: 'mm',
    tempSuffix: '°C',
    windSuffix: 'km/h',
  },
  imperial: {
    label: 'imperial',
    temperatureUnit: 'fahrenheit',
    windSpeedUnit: 'mph',
    precipitationUnit: 'inch',
    tempSuffix: '°F',
    windSuffix: 'mph',
  }
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const state = {
  unitsSystem: loadUnitsPreference(),
  location: null, // { name, latitude, longitude, country_code, admin1 }
  lastWeather: null,
  geocodeAbort: null,
};

function loadUnitsPreference() {
  try {
    const saved = localStorage.getItem('skycast.units');
    if (saved === 'imperial' || saved === 'metric') return saved;
  } catch (_) {}
  return 'metric';
}

function saveUnitsPreference(unitsSystem) {
  try { localStorage.setItem('skycast.units', unitsSystem); } catch (_) {}
}

function showToast(message, timeoutMs = 2200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.setTimeout(() => el.classList.remove('show'), timeoutMs);
}

function formatTimeLocal(isoString, locale, options) {
  try { return new Date(isoString).toLocaleString(locale, options); } catch { return isoString; }
}

function getCacheKey(lat, lon, unitsSystem) {
  return `skycast.cache:${lat.toFixed(3)},${lon.toFixed(3)}:${unitsSystem}`;
}

function writeCache(lat, lon, unitsSystem, payload) {
  const key = getCacheKey(lat, lon, unitsSystem);
  const wrapped = { at: Date.now(), payload };
  try { localStorage.setItem(key, JSON.stringify(wrapped)); } catch (_) {}
}

function readCache(lat, lon, unitsSystem) {
  const key = getCacheKey(lat, lon, unitsSystem);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if ((Date.now() - obj.at) > CACHE_TTL_MS) return null;
    return obj.payload;
  } catch (_) { return null; }
}

function debounce(fn, wait) {
  let timeoutId = null;
  return function(...args) {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn.apply(this, args), wait);
  };
}

function weatherCodeInfo(code) {
  // Mapping condensed to emoji and human-friendly text
  const map = new Map([
    [[0], ['☀️', 'Clear']],
    [[1,2], ['🌤️', 'Mostly clear']],
    [[3], ['☁️', 'Overcast']],
    [[45,48], ['🌫️', 'Fog']],
    [[51,53,55], ['🌦️', 'Drizzle']],
    [[56,57], ['🌧️', 'Freezing drizzle']],
    [[61,63,65], ['🌧️', 'Rain']],
    [[66,67], ['🌧️', 'Freezing rain']],
    [[71,73,75,77], ['🌨️', 'Snow']],
    [[80,81,82], ['🌦️', 'Rain showers']],
    [[85,86], ['🌨️', 'Snow showers']],
    [[95], ['⛈️', 'Thunderstorm']],
    [[96,99], ['⛈️', 'Thunderstorm w/ hail']],
  ]);
  for (const [codes, value] of map) if (codes.includes(code)) return { emoji: value[0], label: value[1] };
  return { emoji: '🌡️', label: 'Weather' };
}

async function geocodeSearch(query, count = 8, signal) {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set('name', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', navigator.language || 'en');
  url.searchParams.set('format', 'json');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  return (data.results || []).map(r => ({
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country_code: r.country_code,
    admin1: r.admin1,
    timezone: r.timezone,
  }));
}

async function fetchWeather(lat, lon, unitsSystem) {
  const cached = readCache(lat, lon, unitsSystem);
  if (cached) return cached;

  const u = UNITS[unitsSystem];
  const url = new URL(FORECAST_ENDPOINT);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('temperature_unit', u.temperatureUnit);
  url.searchParams.set('wind_speed_unit', u.windSpeedUnit);
  url.searchParams.set('precipitation_unit', u.precipitationUnit);
  url.searchParams.set('current', ['temperature_2m','apparent_temperature','precipitation','weather_code','wind_speed_10m','relative_humidity_2m'].join(','));
  url.searchParams.set('hourly', ['time','temperature_2m','apparent_temperature','precipitation_probability','weather_code','wind_speed_10m'].join(','));
  url.searchParams.set('daily', ['time','temperature_2m_max','temperature_2m_min','precipitation_sum','weather_code','wind_speed_10m_max'].join(','));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast failed (${res.status})`);
  const data = await res.json();
  writeCache(lat, lon, unitsSystem, data);
  return data;
}

function setUnitsUI(unitsSystem) {
  const c = document.getElementById('unit-c');
  const f = document.getElementById('unit-f');
  const isMetric = unitsSystem === 'metric';
  c.setAttribute('aria-pressed', String(isMetric));
  f.setAttribute('aria-pressed', String(!isMetric));
}

function setSuggestions(list) {
  const container = document.getElementById('suggestions');
  container.innerHTML = '';
  if (!list || list.length === 0) { container.classList.remove('show'); return; }
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const div = document.createElement('div');
    div.className = 'item';
    div.id = `sug-${i}`;
    div.setAttribute('role', 'option');
    div.innerHTML = `<span>${item.name}</span><span class="sub">${item.admin1 ? item.admin1 + ', ' : ''}${item.country_code || ''}</span>`;
    div.addEventListener('click', () => {
      applyLocation(item);
      container.classList.remove('show');
    });
    container.appendChild(div);
  }
  container.classList.add('show');
}

function closeSuggestions() {
  const container = document.getElementById('suggestions');
  container.classList.remove('show');
}

function displayLocation(loc) {
  const text = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}${loc.country_code ? ' ' + loc.country_code : ''}`;
  document.getElementById('location').textContent = text;
}

function renderCurrent(data, unitsSystem) {
  const u = UNITS[unitsSystem];
  const c = data.current || {};
  const temp = c.temperature_2m;
  const feels = c.apparent_temperature;
  const humidity = c.relative_humidity_2m;
  const wind = c.wind_speed_10m;
  const precip = c.precipitation;
  const info = weatherCodeInfo(c.weather_code ?? 0);

  document.getElementById('current-temp').textContent = `${Math.round(temp)}${u.tempSuffix}`;
  document.getElementById('current-feels').textContent = `${Math.round(feels)}${u.tempSuffix}`;
  document.getElementById('current-humidity').textContent = `${Math.round(humidity)}%`;
  document.getElementById('current-wind').textContent = `${Math.round(wind)} ${u.windSuffix}`;
  document.getElementById('current-precip').textContent = `${precip?.toFixed?.(1) ?? '0'} ${u.precipitationUnit}`;
  document.getElementById('current-desc').textContent = info.label;
  document.getElementById('current-icon').textContent = info.emoji;

  const nowText = formatTimeLocal(new Date().toISOString(), undefined, { hour: '2-digit', minute: '2-digit' });
  document.getElementById('last-updated').textContent = `Updated ${nowText}`;
}

function renderHourly(data, unitsSystem) {
  const u = UNITS[unitsSystem];
  const list = document.getElementById('hourly-list');
  list.innerHTML = '';
  const h = data.hourly;
  if (!h || !Array.isArray(h.time)) return;
  const nowIndex = Math.max(0, h.time.findIndex(t => new Date(t) > new Date()) - 1);
  const endIndex = Math.min(h.time.length, nowIndex + 24);
  for (let i = nowIndex; i < endIndex; i++) {
    const time = formatTimeLocal(h.time[i], undefined, { hour: '2-digit' });
    const icon = weatherCodeInfo(h.weather_code[i]).emoji;
    const temp = Math.round(h.temperature_2m[i]);
    const el = document.createElement('div');
    el.className = 'hour';
    el.innerHTML = `
      <div class="time">${time}</div>
      <div class="icon" aria-hidden="true">${icon}</div>
      <div class="temp">${temp}${u.tempSuffix}</div>
    `;
    list.appendChild(el);
  }
}

function weekdayName(iso) {
  return formatTimeLocal(iso, undefined, { weekday: 'short' });
}

function renderDaily(data, unitsSystem) {
  const u = UNITS[unitsSystem];
  const grid = document.getElementById('daily-grid');
  grid.innerHTML = '';
  const d = data.daily;
  if (!d || !Array.isArray(d.time)) return;
  for (let i = 0; i < Math.min(7, d.time.length); i++) {
    const name = weekdayName(d.time[i]);
    const icon = weatherCodeInfo(d.weather_code[i]).emoji;
    const tmax = Math.round(d.temperature_2m_max[i]);
    const tmin = Math.round(d.temperature_2m_min[i]);
    const precip = (d.precipitation_sum?.[i] ?? 0).toFixed(1);
    const el = document.createElement('div');
    el.className = 'day';
    el.innerHTML = `
      <div class="name">${name}</div>
      <div class="icon" aria-hidden="true">${icon}</div>
      <div class="temps">${tmax}/${tmin}${u.tempSuffix}</div>
      <div class="precip">💧 ${precip} ${u.precipitationUnit}</div>
    `;
    grid.appendChild(el);
  }
}

async function updateWeatherForLocation(loc, force = false) {
  if (!loc) return;
  displayLocation(loc);
  try {
    const data = await fetchWeather(loc.latitude, loc.longitude, state.unitsSystem);
    state.lastWeather = data;
    renderCurrent(data, state.unitsSystem);
    renderHourly(data, state.unitsSystem);
    renderDaily(data, state.unitsSystem);
  } catch (err) {
    console.error(err);
    showToast('Failed to load weather. Try again.');
  }
}

function applyLocation(loc) {
  state.location = loc;
  updateWeatherForLocation(loc, true);
}

function setUnits(unitsSystem) {
  if (state.unitsSystem === unitsSystem) return;
  state.unitsSystem = unitsSystem;
  saveUnitsPreference(unitsSystem);
  setUnitsUI(unitsSystem);
  if (state.location) updateWeatherForLocation(state.location, true);
}

function setupUnitsToggle() {
  setUnitsUI(state.unitsSystem);
  document.getElementById('unit-c').addEventListener('click', () => setUnits('metric'));
  document.getElementById('unit-f').addEventListener('click', () => setUnits('imperial'));
}

function setupSearch() {
  const input = document.getElementById('search-input');
  const container = document.getElementById('suggestions');

  const runSearch = debounce(async () => {
    const q = input.value.trim();
    if (!q) { setSuggestions([]); return; }
    if (state.geocodeAbort) state.geocodeAbort.abort();
    const controller = new AbortController();
    state.geocodeAbort = controller;
    try {
      const results = await geocodeSearch(q, 8, controller.signal);
      setSuggestions(results);
      input.setAttribute('aria-expanded', String(results.length > 0));
    } catch (err) {
      if ((err?.name || '') !== 'AbortError') console.warn(err);
    }
  }, 220);

  input.addEventListener('input', runSearch);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSuggestions();
      input.blur();
    }
    if (e.key === 'Enter') {
      const first = container.querySelector('.item');
      if (first) first.click();
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && e.target !== input) closeSuggestions();
  });
}

function geolocateAndLoad() {
  if (!('geolocation' in navigator)) return Promise.resolve(false);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        // Reverse geocode via nearest search using geocoding endpoint
        const results = await geocodeSearch(`${latitude},${longitude}`, 1);
        const loc = results?.[0] || { name: 'Current location', latitude, longitude };
        applyLocation(loc);
        resolve(true);
      } catch (_) {
        applyLocation({ name: 'Current location', latitude, longitude });
        resolve(true);
      }
    }, () => resolve(false), { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 });
  });
}

async function init() {
  setupUnitsToggle();
  setupSearch();
  // Try geolocation, else fallback to a default city
  const ok = await geolocateAndLoad();
  if (!ok) {
    const fallback = { name: 'New York', admin1: 'NY', country_code: 'US', latitude: 40.7128, longitude: -74.0060 };
    applyLocation(fallback);
  }
}

// Kickoff
init();
