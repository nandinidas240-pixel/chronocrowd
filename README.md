# 👁️ ChronoCrowd: The All-Seeing Stadium Command Center

## 🏟️ Challenge Vertical
**Physical Event Experience** (Sporting Venues)

## 🧠 The Concept
ChronoCrowd is an autonomous, geo-intelligent command center that provides total oversight of stadium crowd dynamics. Set during the **Cricket World Finals at M. Chinnaswamy Stadium**, the system solves "The Halftime Bottleneck" by giving fans an all-seeing view of venue logistics.

## 🚀 Innovation Highlights
* **Predictive Wait-Time Telemetry:** Real-time counters for stadium zones (North Stand, East Gate, Food Courts) that fluctuate based on crowd density.
* **The Seat-Sync Protocol:** A specialized coordination tool allowing fans to broadcast their exact Block/Row/Seat coordinates to their group instantly.
* **AI-Powered Halftime Optimization:** An intelligent advisory feed that reroutes fans to low-congestion zones *before* they reach a bottleneck.
* **Weather-Responsive Logic:** Integrated **Open-Meteo API** data to suggest shaded stands or indoor lounges during heat spikes.
* **Google Identity Services:** One-tap **Sign in with Google** via the official GIS library (`accounts.google.com/gsi/client`).
* **Firebase Real-Time Telemetry:** Stadium zone density documents synced via the **Firebase JavaScript SDK v10** (ESM, loaded from `gstatic.com`).
* **Google Maps JS API:** Interactive stadium map initialized via `initChronoMap()` callback with a custom marker and hybrid map type.

## 🛠️ Tech Stack
* **Frontend:** Glassmorphism UI built with HTML5, CSS3, and ES6+ JavaScript.
* **API Layer:** Live Weather Data (Open-Meteo) + Simulated Telemetry Loop.
* **Branding:** "All-Seeing Eye" (Eye of Providence) identity symbolizing total venue oversight.
* **Testing:** Jest 29 + jest-environment-jsdom — 5 test suites covering sanitization, AI scoring, Maps, theme state, and Seat-Sync validation.

## ☁️ Powered By
| Service | Purpose |
|---|---|
| **Google Cloud Platform (GCP)** | Hosting, API key management, OAuth 2.0 credentials |
| **Firebase (GCP)** | Real-time crowd telemetry sync via Firebase Realtime Database |
| **Google Maps JavaScript API** | Interactive stadium map with custom marker (`initChronoMap` callback) |
| **Google Identity Services (GIS)** | Sign in with Google — One Tap & rendered button (`accounts.google.com/gsi`) |
| **Open-Meteo API** | Live weather data (no API key required) for weather-aware AI scoring |
| **Google Fonts** | Inter (body) + Syne (headings) typography |
| **Google Calendar API** | "Add to Calendar" deep links for stadium events |