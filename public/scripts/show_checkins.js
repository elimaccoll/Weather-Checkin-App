window.onload = main();

async function getData() {
    const response = await fetch('/api_get');
    const data = await response.json();
    console.log(data);
    return data;
}

function printData(data) {
    const container = document.getElementById("content-container");
    for (item of data) {
        const entry_container = document.createElement("div");
        entry_container.className = "entry-container";
        const location = document.createElement("div");
        location.className = "entry-location";
        const datetime = document.createElement("div");
        datetime.className = "entry-datetime";
        entry_container.append(location, datetime);

        location.textContent = `Latitude: ${item.latitude}°, Longitude: ${item.longitude}° `;
        const date = new Date(item.timestamp);
        let datetime_str = date.getDate()+
                            "/"+(date.getMonth()+1)+
                            "/"+date.getFullYear()+
                            " "+date.getHours()+
                            ":"+date.getMinutes()+
                            ":"+date.getSeconds();
        datetime.textContent = `Date: ${datetime_str}`
        container.append(entry_container);
    }
}

// Map Stuff
async function renderMap(data) {
    const mymap = L.map('app_map').setView([0, 0], 1);
    const attribution = 
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreeMap</a> contributors';
    
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileUrl, {attribution});
    tiles.addTo(mymap);

    let markers = [];
    for (item of data) {
        const lat = item.latitude;
        const lon = item.longitude;
        let desc = `Latitude: ${lat}&nbsp;&nbsp;
                        Longitude: ${lon}<br>
                        Temp: ${item.temp}&deg;F&nbsp;&nbsp;
                        Feels like: ${item.app_temp}&deg;F<br>
                        AQI: ${item.aqi}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Air Quality: ${item.aqi_status}`;

        if (item.air_quality_data.length > 0) desc += `<br>OpenAQ Data:&nbsp;&nbsp; ${item.air_quality_data[0].parameter} = ${item.air_quality_data[0].value} ${item.air_quality_data[0].unit}`;
        else desc += `<br>No OpenAQ Data Found`;
        const marker = L.marker([lat,lon]).addTo(mymap);
        marker.bindPopup(desc);
        markers.push({lat, lon});
    }

    const focus_btn = document.getElementById('focus_map');
    let focus_index = 0;
    focus_btn.addEventListener('click', () => {
        let next_marker = markers[focus_index];
        mymap.setView([next_marker.lat,next_marker.lon], 18);
        focus_index++;
        if (focus_index >= markers.length) focus_index = 0;
    });
}

async function main() {
    const data = await getData();
    // printData(data);
    renderMap(data);
}