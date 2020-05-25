//make map
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetmap</a>';
const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl, { attribution });
const userMap = L.map("userMap").setView([0, 0], 1);
tiles.addTo(userMap);

// getWeatherInfo(latitude, longitude){

// };

function getUserPosition() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      document.getElementById("latitude").textContent = latitude.toFixed(2);
      document.getElementById("longitude").textContent = longitude.toFixed(2);
      try {
        // getWeatherInfo(latitude, longitude);

        const api_url = `weather/${latitude},${longitude}`;

        const response = await fetch(api_url);
        const json = await response.json();
        console.log(json);

        const weather = json.weather;
        const air_quality = json.air_quality.results[0].measurements[0];

        document.getElementById("summary").textContent =
          weather.current.weather_descriptions;
        document.getElementById("temperature").textContent =
          weather.current.temperature;
        document.getElementById("city").textContent = weather.location.name;
        document.getElementById("weather-icon").src =
          weather.current.weather_icons;
        document.getElementById("weather-icon").alt =
          weather.current.weather_descriptions;

        document.getElementById("aq_parameters").textContent =
          air_quality.parameter;
        document.getElementById("aq_value").textContent = air_quality.value;
        document.getElementById("aq_units").textContent = air_quality.unit;
        document.getElementById("aq_lastUpdated").textContent =
          air_quality.lastUpdated;
        const data = { latitude, longitude, weather, air_quality };
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
        const db_response = await fetch("/api", options);
        const db_json = await db_response.json();
        console.log(db_json);
      } catch (error) {
        console.error(error);
        console.log("no air quality information available for this place");

        const { latitude, longitude } = position.coords;
        document.getElementById("latitude").textContent = latitude.toFixed(2);
        document.getElementById("longitude").textContent = longitude.toFixed(2);

        const api_url = `weather/${latitude},${longitude}`;

        const response = await fetch(api_url);
        const json = await response.json();
        console.log(json);

        const weather = json.weather;

        document.getElementById("summary").textContent =
          weather.current.weather_descriptions;
        document.getElementById("temperature").textContent =
          weather.current.temperature;
        document.getElementById("city").textContent = weather.location.name;
        document.getElementById("weather-icon").src =
          weather.current.weather_icons;
        document.getElementById("weather-icon").alt =
          weather.current.weather_descriptions;

        document.getElementById("aq_parameters").textContent = "no reading";
        document.getElementById("aq_value").textContent = "---";
        document.getElementById("aq_units").textContent = "---";
        document.getElementById("aq_lastUpdated").textContent = "---";
        const data = { latitude, longitude, weather };
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
        const db_response = await fetch("/api", options);
        const db_json = await db_response.json();
        console.log(db_json);
        console.log(json);
      }
    });
  } else {
    console.log("geolocation IS NOT available");
  }
}

async function getData() {
  const response = await fetch("/api");
  const data = await response.json();

  for (item of data) {
    // add markers to map
    const icon = L.icon({
      iconUrl: item.weather.current.weather_icons,
      iconSize: [25, 25],
      iconAnchor: [25, 16],
      popupAnchor: [-3, -76],
    });

    let txt = `The weather here in ${item.weather.location.name} is
    ${item.weather.current.weather_descriptions} with a temperature of
    ${item.weather.current.temperature} °C. `;

    if (item.air_quality) {
      txt += `The concentration of particulate
      matter (${item.air_quality.parameter}) is
      ${item.air_quality.value} ${item.air_quality.unit} last read on
      ${item.air_quality.lastUpdated}.`;
    }
    else {
      txt += "<br>No air quality reading available.";
    }

    const marker = L.marker([item.latitude, item.longitude], {
      icon: icon,
      title: item.weather.location.name,
    });
    marker.addTo(userMap);
    marker.bindPopup(txt);
  }

  console.log(data);
}

//inputs and events
const buttonPosition = document.getElementById("button-1");
buttonPosition.addEventListener("click", getUserPosition);

const buttonGetData = document.getElementById("button-3");
buttonGetData.addEventListener("click", (event) => {
  getData();
  buttonGetData.removeEventListener("click", event);
});

// const usermoodInputField = document.getElementById("mood-input");
// usermoodInputField.addEventListener("keyup", (event) => {
//   if (event.key === "Enter") {
//     getUserPosition();
//   }
// });

// function displayMap() {
//   if ("geolocation" in navigator) {
//     navigator.geolocation.getCurrentPosition((position) => {
//       const { latitude, longitude } = position.coords;
//       const coord = [latitude, longitude];
//       const marker = L.marker([latitude, longitude]).addTo(userMap);
//       marker.setLatLng([latitude, longitude]);
//       userMap.setView([latitude, longitude], 12);
//     });
//   } else {
//     console.log("geolocation IS NOT available");
//   }
// }

// function getUserMood() {
//   return document.getElementById("mood-input").value;
// }

// const buttonMap = document.getElementById("button-2");
// buttonMap.addEventListener("click", displayMap);
