
let apiKey = '866141fb7c26836e8f40e14146bbd900'

cityName='Atlanta'

fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`).then(function(weatherReport) {
    console.log(weatherReport.json());
})