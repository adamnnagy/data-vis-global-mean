function setup() {
    noCanvas();
    const video = createCapture(VIDEO);
    video.parent("p5-canvas");
    video.size(480, 320);

    
    const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetmap</a>';
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const tiles = L.tileLayer(tileUrl, { attribution });
    const userMap = L.map("userMap").setView([0, 0], 1);
    
    tiles.addTo(userMap);
    
    function getUserPosition() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          video.loadPixels();
          const image64 = video.canvas.toDataURL();
          document.getElementById(
            "latitude"
            ).textContent = latitude.toFixed(2);
            document.getElementById(
              "longitude"
              ).textContent = longitude.toFixed(2);
              
          //Posting to server api
          const data = { usermood: getUserMood(), latitude, longitude, image64 };
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
        });
      } else {
        console.log("geolocation IS NOT available");
      }
    }

    function displayMap() {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const coord = [latitude, longitude];
          const marker = L.marker([latitude, longitude]).addTo(userMap);
          marker.setLatLng([latitude, longitude]);
          userMap.setView([latitude, longitude], 12);
        });
      } else {
        console.log("geolocation IS NOT available");
      }
    }

    function getUserMood() {
      return document.getElementById("mood-input").value;
    }

    async function getData() {
      const response = await fetch("/api");
      const data = await response.json();
      console.log(data);

      for (item of data) {
        const root = document.createElement("div");
        const mood = document.createElement("div");
        const geo = document.createElement("div");
        const date = document.createElement("div");
        const image = document.createElement("img");

        mood.textContent = `mood: ${item.usermood ? item.usermood : "N/A"} | `;
        geo.textContent = `lat, lon: ${item.latitude}°, ${item.longitude}° | `;
        const dateString = new Date(item.timestamp).toLocaleString();
        date.textContent = `${dateString}`;
        image.src = item.image64 ? item.image64 : "rainbow.jpg";
        image.alt = `The mood portrayed in this image is ${item.mood}`;

        root.classList.add("row");
        root.append(mood, geo, date, image);
        document.body.append(root);
        //add markers to map
        const marker = L.marker([item.latitude, item.longitude], {
          title: `${item.mood}`,
        }).addTo(userMap);
      }
    }

    const buttonPosition = document.getElementById("button-1");
    buttonPosition.addEventListener("click", getUserPosition);
    const buttonMap = document.getElementById("button-2");
    buttonMap.addEventListener("click", displayMap);
    const buttonGetData = document.getElementById("button-3");
    buttonGetData.addEventListener("click", getData);

    const usermoodInputField = document.getElementById("mood-input");
    usermoodInputField.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        getUserPosition();
      }
    });
  }