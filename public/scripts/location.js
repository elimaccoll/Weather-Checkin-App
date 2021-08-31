if('geolocation' in navigator) {
    console.log('Geolocation Available');
    navigator.geolocation.getCurrentPosition(async position => {
        const latitude = position.coords.latitude.toFixed(2);
        const longitude = position.coords.longitude.toFixed(2);
        document.getElementById('lat').textContent = latitude;
        document.getElementById('lon').textContent = longitude;

        // Using my own endpoint
        // Weather API: https://www.weatherbit.io/api/weather-current
        // Air Quality API: https://docs.openaq.org/
        const weather_api_url = `/weather/${latitude},${longitude}`;
        const response = await fetch(weather_api_url);
        const json = await response.json();
        const weather_data = json.weather.data[0];
        console.log(json);
        console.log(weather_data);
        
        let air_quality_data = [];
        let air_quality_data_found = false;
        if (json.air_quality.results.length > 0) {
            air_quality_data_found = true;
            air_quality_data = json.air_quality.results[0].measurements;
        }
        const city_state_container = document.getElementById("city_state");
        const temp_container = document.getElementById("temp");
        const app_temp_container = document.getElementById("app-temp");
        const aqi_container = document.getElementById("air_quality_index");

        function cToF(cTemp) {
            return (cTemp*(9/5) + 32).toFixed(2);
        }

        function checkAQI(aqi) {
            let aqi_status = "";
            if (aqi <= 50) aqi_status = "Good";
            else if (aqi <= 100) aqi_status = "Moderate";
            else if (aqi <= 150) aqi_status = "Unhealthy for Sensitive Groups";
            else if (aqi <= 200) aqi_status = "Unhealthy";
            else if (aqi <= 300) aqi_status = "Very Unhealthy";
            else aqi_status = "Hazardous"; // Greater than 300
            return aqi_status;
        }

        city_state_container.textContent = `${weather_data.city_name}, ${weather_data.state_code}`;
        temp_container.textContent = `Temperature: ${cToF(weather_data.temp)}° F`;
        app_temp_container.textContent = `Feels Like: ${cToF(weather_data.app_temp)}° F`;
        aqi_container.textContent = `Air Quality Index: ${weather_data.aqi}, ${checkAQI(weather_data.aqi)}`;

        const air_quality_container = document.getElementById("air_quality_container");
        if (air_quality_data_found) {
            const measurement_update_date = document.createElement("p");
            measurement_update_date.id = "aq_update_date";
            const update_date = air_quality_data[0].lastUpdated.split('T').slice(0,1);
            measurement_update_date.textContent = `Last Updated: ${update_date}`
            air_quality_container.append(measurement_update_date);

            const measurement_list = document.createElement("ul");
            measurement_list.id = "aq-measurement-list"
            for (item of air_quality_data) {
                const measurement = document.createElement("li");
                measurement.className = "aq-measurement";
                measurement.textContent = `${item.parameter}: ${item.value} ${item.unit}`;
                measurement_list.append(measurement);
            }
            air_quality_container.append(measurement_list);
        }
        else {
            const measurement_status = document.createElement("p");
            measurement_status.textContent = "No Measurements Found";
            air_quality_container.append(measurement_status);
        }

        const temp = cToF(weather_data.temp);
        const app_temp = cToF(weather_data.app_temp);
        const aqi = weather_data.aqi;
        const aqi_status = checkAQI(aqi);

        const timestamp = Date.now();
        const log_data = {timestamp, latitude, longitude, temp, app_temp, aqi, aqi_status, air_quality_data};
        await logData(log_data);
    });

    async function logData(data) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        const response = await fetch ('/api_checkin', options);
    }

} else {
    console.log('Geolocation Not Available');
}
