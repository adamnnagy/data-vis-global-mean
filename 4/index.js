const express = require("express");
const fs = require("fs");
const Datastore = require("nedb");

const app = express();
app.listen(3000, () => console.log("listening at 3000"));

app.use(express.static("public"));
app.use(
  express.json({
    limit: "1mb",
  })
);

const coordinatesDatabase = new Datastore("coordinatesDatabase.db");
coordinatesDatabase.loadDatabase();

app.post("/api", (request, response) => {
  console.log(request.body);
  const data = request.body;
  const timestamp = Date.now();
  data.date = new Date(Date.now());
  data.timestamp = timestamp;
  coordinatesDatabase.insert(data);
  response.json({
    status: "success",
    username: data.username,
    latitude: data.latitude,
    longitude: data.longitude,
    date: data.date,
  });

  const logInfo = `${data.latitude},${data.longitude},${data.date}\n`;
  fs.appendFile("records/records.csv", logInfo, (err) => {
    if (err) return console.error(err);
  });

  const dateString = data.date.toDateString();
  const logText = `latitude: ${data.latitude}, longitude: ${data.longitude}, date: ${dateString}\n`;
  fs.appendFile("records/records.txt", logText, (err) => {
    if (err) return console.error(err);
  });
});
