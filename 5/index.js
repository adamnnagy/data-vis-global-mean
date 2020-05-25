const express = require("express");
const fs = require("fs");
const Datastore = require("nedb");
const fetch = require("node-fetch");
require('dotenv').config();

const app = express();
app.listen(3000, () => console.log("listening at 3000"));

app.use(express.static("public"));
app.use(
  express.json({
    limit: "1mb",
  })
);

const coordinatesDatabase = new Datastore("records/coordinatesDatabase.db");
coordinatesDatabase.loadDatabase();

app.get("/api", (request, response) => {
  coordinatesDatabase.find({}, (err, data) => {
    if (err) {
      console.log(err);
    }
    response.json(data);
  });
});

app.post("/api", (request, response) => {
  console.log(request.body);
  const data = request.body;
  const timestamp = Date.now();
  data.date = new Date(Date.now());
  data.timestamp = timestamp;
  coordinatesDatabase.insert(data);
  response.json(data);

 
});

app.get("/weather/:latlon", async (request, response) => {
  const [latitude, longitude] = request.params.latlon.split(",");

  const weather_key = process.env.API_KEY;
  const weather_url = `http://api.weatherstack.com/current?access_key=${weather_key}&query=${latitude},${longitude}`;
  const weather_response = await fetch(weather_url);
  const weather_json = await weather_response.json();
  
  const aq_url = `https://api.openaq.org/v1/latest?coordinates=${latitude},${longitude}`;
  const aq_response = await fetch(aq_url);
  const aq_json = await aq_response.json();
  
  const data = {
    weather: weather_json,
    air_quality: aq_json
  }
  
  response.json(data);
});
