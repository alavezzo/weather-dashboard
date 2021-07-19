let today = luxon.DateTime.now().toLocaleString()
let todayDivEl = $('.todays-weather')
let forecastEl = $('.five-day')
let listGroupDiv = $('.list-group')
let searchedCities = []
let push = true

$(".btn-primary").click(function () {
    // get form values
    event.preventDefault();
    var cityText = $("#searchBar").val();
    if (cityText) {
        fetchWeatherData(cityText);
    };
});

let loadCities = function() {
    let storage = localStorage.getItem('Cities')
    if (storage !== null) {
        searchedCities = JSON.parse(storage)
        renderList();
    }
}

let setCities = function (city) {
    if (searchedCities.length === 0) {
        searchedCities.push(city);
        saveCities();
    } else {
        // check if city has already been searched
        for (i = 0; i < searchedCities.length; i++) {
            if (city === searchedCities[i]) {
                push = false
            }
        }
        if (push) {
            searchedCities.push(city);
            saveCities();
        } else {
            push = true
        }
    }
}
let saveCities = function () {
    localStorage.setItem('Cities', JSON.stringify(searchedCities))
    renderList();
}

let renderList = function () {
    listGroupDiv.empty()
    for (i = 0; i < searchedCities.length; i++) {
        let listItemEl = $('<li>').addClass('list-group-item').text(searchedCities[i])
        listGroupDiv.append(listItemEl)
    }
}

let fetchWeatherData = function (cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=866141fb7c26836e8f40e14146bbd900`).then(function (weatherReport) {
        if (weatherReport.ok) {
            weatherReport.json().then(function (weatherReport) {
                todayDivEl.empty();
                forecastEl.empty();
                let city = weatherReport.name
                let cityEl = $('<h1>').text(city + ' (' + today + ')')
                let temp = weatherReport.main.temp
                let tempEl = $('<p>').text(temp + ' F')
                let wind = weatherReport.wind.speed
                let windEl = $('<p>').text(wind + ' MPH')
                let humidity = weatherReport.main.humidity
                let humidityEl = $('<p>').text(humidity + ' %')
                todayDivEl.append(cityEl)
                todayDivEl.append(tempEl)
                todayDivEl.append(windEl)
                todayDivEl.append(humidityEl)
                setCities(city)
                $("#searchBar").val('')
                let lat = weatherReport.coord.lat
                let lon = weatherReport.coord.lon
                fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=866141fb7c26836e8f40e14146bbd900`).then(function (weatherForecast) {
                    return weatherForecast.json();
                }).then(function (weatherForecast) {
                    let uvi = weatherForecast.current.uvi
                    let uviEl = $('<p>').text('UV Index: ' + uvi)
                    for (i = 1; i < 6; i++) {
                        let day = luxon.DateTime.now().plus({ days: i }).toLocaleString()
                        let dayEl = $('<h5>').text(day)
                        let temp = weatherForecast.daily[i].temp.max
                        let tempEl = $('<p>').text('Temp: ' + temp + ' F')
                        let wind = weatherForecast.daily[i].wind_speed
                        let windEl = $('<p>').text('Wind: ' + wind + ' MPH')
                        let humidity = weatherForecast.daily[i].humidity
                        let humidityEl = $('<p>').text('Humidity: ' + humidity + ' %')
                        let cardDivEl = $('<div>').addClass('col mb-3')
                        let cardEl = $('<div>').addClass('card')
                        todayDivEl.append(uviEl);
                        cardEl.append(dayEl).append(tempEl).append(windEl).append(humidityEl)
                        cardDivEl.append(cardEl)
                        forecastEl.append(cardDivEl)
                    }
                });
            });
        }
        else {
            alert('Error: GitHub User Not Found')
        };
    });
}

loadCities();
