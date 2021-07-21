let todayDivEl = $('.todays-weather')
let fiveDayHeaderEl = $('.five-day-header')
let forecastEl = $('.five-day')
let listGroupDiv = $('.list-group')
let searchedCities = []
let push = true

$('.btn-primary').click(function () {
    // get form values
    event.preventDefault();
    let cityText = $('#searchBar').val().trim();
    if (cityText) {
        fetchWeatherData(cityText);
    };
});

listGroupDiv.on('click', 'button', function () {
    event.preventDefault();
    let cityText = $(this).html()
    fetchWeatherData(cityText);
})

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
        let listItemEl = $('<li>').addClass('list-group-item')
        let savedCityButton = $('<button>').addClass('btn city-btn').text(searchedCities[i])
        listItemEl.append(savedCityButton)
        listGroupDiv.append(listItemEl)
    }
}

let setUviBackground = function(uvi, uviEl) {
    if (uvi<2.5){
        uviEl.addClass('green')
    } else if (uvi >2.5 && uvi < 5.5) {
        uviEl.addClass('yellow')
    } else if (uvi >5.5 && uvi<7.5) {
        uviEl.addClass('orange')
    } else if (uvi >7.5 && uvi<10.5) {
        uviEl.addClass('red')
    } else {
        uviEl.addClass('violet')
    }
    todayDivEl.append(uviEl)
}


let fetchWeatherData = function (cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&exclude=minutely,hourly,alerts&appid=866141fb7c26836e8f40e14146bbd900`).then(function (weatherReport) {
        if (weatherReport.ok) {
            weatherReport.json().then(function (weatherReport) {
                todayDivEl.empty();
                fiveDayHeaderEl.empty();
                forecastEl.empty();
                let city = weatherReport.name
                let iconCodeToday = weatherReport.weather[0].icon
                let iconToday = `https://openweathermap.org/img/wn/${iconCodeToday}@2x.png`
                let iconTodayEl = $('<img>').attr('src', iconToday)
                let cityEl = $('<h3>').html("<span id='city'>" + city + '</span>' + " (<span id='date'></span>) ").append(iconTodayEl)
                let temp = weatherReport.main.temp
                let tempEl = $('<p>').text('Temp: ' + temp + ' F')
                let wind = weatherReport.wind.speed
                let windEl = $('<p>').text('Wind: ' + wind + ' MPH')
                let humidity = weatherReport.main.humidity
                let humidityEl = $('<p>').text('Humidity: ' + humidity + ' %')
                todayDivEl.append(cityEl)
                todayDivEl.append(tempEl)
                todayDivEl.append(windEl)
                todayDivEl.append(humidityEl)
                setCities(city)
                $("#searchBar").val('')
                let lat = weatherReport.coord.lat
                let lon = weatherReport.coord.lon
                fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly,alerts&appid=866141fb7c26836e8f40e14146bbd900`).then(function (weatherForecast) {
                    return weatherForecast.json();
                }).then(function (weatherForecast) {
                    console.log(weatherForecast)
                    let timeZone = weatherForecast.timezone
                    let today = luxon.DateTime.now().setZone(timeZone).toLocaleString()
                    let dateEl = $('#date')
                    dateEl.append(today)
                    console.log(timeZone)
                    let uvi = weatherForecast.current.uvi
                    let uviEl = $('<p>').text('UV Index: ' + uvi);
                    setUviBackground(uvi, uviEl);
                    let headerEl = $('<h4>').text('Five Day Forecast:')
                    fiveDayHeaderEl.append(headerEl)
                    for (i = 1; i < 6; i++) {
                        let day = luxon.DateTime.now().setZone(timeZone).plus({ days: i }).toLocaleString()
                        let dayEl = $('<h5>').text(day)
                        let iconCode = weatherForecast.daily[i].weather[0].icon
                        let icon = `https://openweathermap.org/img/wn/${iconCode}@2x.png`
                        let iconEl = $('<img>').attr('src', icon)
                        let temp = weatherForecast.daily[i].temp.max
                        let tempEl = $('<p>').text('Temp: ' + temp + ' F')
                        let wind = weatherForecast.daily[i].wind_speed
                        let windEl = $('<p>').text('Wind: ' + wind + ' MPH')
                        let humidity = weatherForecast.daily[i].humidity
                        let humidityEl = $('<p>').text('Humidity: ' + humidity + ' %')
                        let cardDivEl = $('<div>').addClass('col mb-3')
                        let cardEl = $('<div>').addClass('card')
                        cardEl.append(dayEl).append(iconEl).append(tempEl).append(windEl).append(humidityEl)
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

setInterval(function(){
    if ($('#city') !== null) {
        let city = $('#city').text().trim();
        fetchWeatherData(city);
    }
  }, ((1000*60)*30))