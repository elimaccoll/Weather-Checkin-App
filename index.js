const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Starting server at port ${port}`);
});
app.use(express.static('public'));
app.use(express.json( {limit: '1mb'}));

const database = new Datastore('database.db');
database.loadDatabase();

// Database POST Request
app.post('/api_checkin', (request, response) => {
    const data = request.body;
    database.insert(data);
});

// Database GET Request
app.get('/api_get', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            console.log(err);
            return;
        }
        response.json(data);
    });
})

// Proxy Server for the Weather API
app.get('/weather/:latlon', async (request, response) => {
    const latlon = request.params.latlon.split(',');
    const latitude = latlon[0];
    const longitude = latlon[1];

    // Could use Promise.all()
    // Using an environment variable with dotenv (.env file) to hide API key
    const weather_api_key = process.env.WEATHER_API_KEY;
    const weather_api_url = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${weather_api_key}`;
    const weather_response = await fetch(weather_api_url);
    const weather_data = await weather_response.json();

    const aq_api_url = `https://docs.openaq.org/v2/latest?coordinates=${latitude},${longitude}`;
    const aq_response = await fetch(aq_api_url);
    const aq_data = await aq_response.json();
    
    const data = {
        weather: weather_data,
        air_quality: aq_data
    }

    response.json(data);
});