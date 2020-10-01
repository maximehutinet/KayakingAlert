// Hide the cards on the first load
$('.card-river').hide();
$('.sign-up').hide();
$('.overlay').hide();
$('.login-form').hide();
$('.sign-up-form').hide();
$('#card-filter').hide();
$('#alert-search').hide();

var macarte = null;
let latitude  = 46.823;
let longitude = 7.539;
var TabRivers = [];
var markersCluster = L.markerClusterGroup();

// Get the location of the user
navigator.geolocation.getCurrentPosition(success, error);

$('#filter-water-temp').on('change', function(e) {
  var id = e.target.value;
  document.getElementById("water-temp").innerHTML = id;
  if(id > 0){
    filterRiverTemperature(id);
  }
  else{
      fillDataInRiverMarker(TabRivers);
  }
});
$('#filter-water-temp').change();


// Hide the card if the user click on the navbar
$('.navbar').on('click', function (e) {
    $('.card-river').fadeOut();
});

// Hide the card if the user click on the map
$('#map').on('click', function (e) {
    $('.card-river').fadeOut();
});

// Show the filter card if the user clic on the button
$('#button-filter').on('click', function (e) {
    $('#card-filter').fadeIn();
});

// Close the filter card if the user clic on the button x
$('#close-filter').on('click', function (e) {
    $('#card-filter').fadeOut();
});

// If the user click on the overlay then make the box disappear
$('.overlay').on('click', function (e) {
    $('.sign-up').fadeOut();
    $('.login-form').fadeOut();
    $('.sign-up-form').fadeOut();
    removeBluryBackground();

});

// If the user click on the button inside a river popup
$(document.body).on('click', '.alert-me', showLoginOrSignup);
$(document.body).on('click', '.more-infos', onClickMoreDetails);
$(document.body).on('click', '.log-in-from-alert', showLoginForm);
$(document.body).on('click', '.comment-river', showLoginOrSignup);
$(document.body).on('click', '.sign-up-from-alert', showSignUpForm);

function displayBuryBackground() {
    $('.wrapper').css("backdrop-filter","blur(4px)");
    $('.overlay').show();
}

// Remove the blury background on the page
function removeBluryBackground() {
    $('.wrapper').css("backdrop-filter","blur(0)");
    $('.overlay').fadeOut();
}


// If the user accepted to share his location
function success(position) {
    latitude  = position.coords.latitude;
    longitude = position.coords.longitude;
    initMap(latitude,longitude);
}

// If the user refused to share his location
function error() {
    console.log('The location coudln\'t be retrieved from the browser.')
    initMap(latitude,longitude);
}

// Center the map on a certain coordinates
function initMap(latitude,longitude) {
    macarte = L.map('map').setView([latitude, longitude], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20
    }).addTo(macarte);
    getRivers(function (riverInformation) {
        fillDataInRiverMarker(riverInformation);
    });
}

// Get city coordinates from openstreetmap
function getCity(name) {
    let uri = 'https://nominatim.openstreetmap.org/search?city='+name+'&format=json';
    $.getJSON(uri, function(data){
        macarte.setView([data[0]['lat'], data[0]['lon']]);
    });
}

// Search for a city, get coordinates and reload the map
$('#search-city').submit(function () {
    getCity($('#search-city input').val());
    $("#search-city").trigger("reset");
    return false;
});

// Search for a river, if the river doesn't exist it displays an error
$('#search-river').submit(function () {
    keyWord = $('#search-river input').val();
    if(!searchRiver(keyWord)){
        $('#alert-search').html('Impossible to find ' + keyWord);
        $('#alert-search').fadeIn();
        setTimeout(function(){
            $('#alert-search').fadeOut();
        }, 1000);
    }
    $("#search-river").trigger("reset");
    return false;
});


function popupMarker(id){
    markersCluster.eachLayer(function (layer) {
        if (layer.options.title == id){
            layer.openPopup();
        }
    });

}

function searchRiver(keyWord){
    var state = false;
    for (let river in TabRivers.rivers) {
        if((TabRivers.rivers[river].name).toLowerCase().includes(keyWord.toLowerCase())){
            macarte.setView([TabRivers.rivers[river].latitude, TabRivers.rivers[river].longitude],15);
            state = true;
            popupMarker(TabRivers.rivers[river]['station-number']);

        }
    }
    return state;
}

// Get the weather based on GPS coordinates
function getWeather(latitude,longitude,weatherInformation){
    let uriWeather = 'https://www.prevision-meteo.ch/services/json/lat=' + latitude + 'lng=' + longitude;
    NProgress.start();

      $.getJSON(uriWeather,function (dataWeather) {
          weatherInformation(dataWeather);
          NProgress.inc(0.2);
          NProgress.done();

      });
}

// If the user click on more details
function onClickMoreDetails(event){
    let uri = 'http://127.0.0.1:5000/river/' + event.target.dataset['river'];
    $.getJSON(uri, function(data){
        getWeather(data.river[0].latitude,data.river[0].longitude,function (weatherInformation) {
        $('#river-info-name').html(data.river[0].name);
        $('#river-info-text').html(
            '<br/><b>Water level :</b> ' + data.river[0]['water-level'] + " m3/s" +
            '<br/><b>Water temperature :</b> ' + data.river[0]['temperature'] + " °C" +
            '<br/><b>Outside temperature :</b> ' + weatherInformation.current_condition.tmp + " °C" +
            '<br/><b>Weather :</b> ' + weatherInformation.current_condition.condition + " " +
            '<img src="'+weatherInformation.current_condition.icon+'" alt="Weather Image" width="20px">' +
            '<br/><b>Wind speed :</b>' + " " + weatherInformation.current_condition.wnd_spd + " Km/h" +
            '<br/><b>Wind direction :</b>' + " " + weatherInformation.current_condition.wnd_dir +
            '<br/><b>Tomorrow :</b> ' + weatherInformation.fcst_day_1.condition + " " +
            '<img src="'+weatherInformation.fcst_day_1.icon+'" alt="Weather Image" width="20px">' +
            '<br/><button type="button" class="btn btn-danger comment-river" data-river="'+event.target.dataset['river']+'" >Comment</button>'+ " " +
            '<button type="button" class="btn btn-warning alert-me" data-river="'+event.target.dataset['river']+'" >Alert me</button>'
        );
        $('.card-river').fadeIn();
        });
    });
}

// If the user click on alerte-me
function showLoginOrSignup(event){
    displayBuryBackground();
    $('.card-sign-up').html(
        '<button type="button" class="btn btn-outline-primary log-in-from-alert" data-river="'+event.target.dataset['river']+'">Log In</button>' + '<br/>' +
        '<button type="button" class="btn btn-outline-warning sign-up-from-alert" data-river="'+event.target.dataset['river']+'">Sign Up</button>'
    );

    $('.sign-up').fadeIn();

}

function showLoginForm(event){
    $('.sign-up').hide();
    $('#login-form-text').html(
            '<div class="form-group">' +
                '<label for="InputEmail">Email address</label>' +
                '<input type="email" class="form-control" id="InputEmail" aria-describedby="emailHelp" placeholder="Enter email">' +
            '</div>' +
            '<div class="form-group">'+
                '<label for="InputPassword">Password</label>' +
                '<input type="password" class="form-control" id="InputPassword" placeholder="Password">' +
            '</div>' +
        '<button type="button" class="btn btn-outline-primary log-in-from-form" data-river="'+event.target.dataset['river']+'">Log In</button>'

    );
    $('.login-form').fadeIn();
}

function showSignUpForm(event){
    $('.sign-up').hide();
    $('#sign-up-form-text').html(
        '<div class="form-group">' +
                '<label for="InputName">Name</label>' +
                '<input type="name" class="form-control" id="InputName" placeholder="Name">' +
        '</div>' +
        '<div class="form-group">' +
                '<label for="InputFirstname">Firstname</label>' +
                '<input type="firstname" class="form-control" id="InputFirstname" placeholder="Firstname">' +
        '</div>' +
        '<div class="form-group">' +
                '<label for="InputEmail">Email address</label>' +
                '<input type="email" class="form-control" id="InputEmail" placeholder="Enter email">' +
        '</div>' +
        '<div class="form-group">'+
                '<label for="InputPassword">Password</label>' +
                '<input type="password" class="form-control" id="InputPassword" placeholder="Password">' +
        '</div>' +
        '<div class="form-group">'+
                '<label for="InputPasswordConfirmation">Password confirmation</label>' +
                '<input type="password" class="form-control" id="InputPasswordConfirmation" placeholder="Retype password">' +
        '</div>' +
        '<button type="button" class="btn btn-outline-warning register" data-river="'+event.target.dataset['river']+'">Register</button>'
    );
    $('.sign-up-form').fadeIn();
}

function fillDataInRiverMarker(data){
    for (let river in data.rivers){

              NProgress.start();
              NProgress.set(0.4);

          var popup = '<h6>' + data.rivers[river].name + '</h6>' +
              '<br/><b>Water Level :</b> ' + data.rivers[river]['water-level'] + " m3/s" +
              '<br/><b>Water Temperature :</b> ' + data.rivers[river]['temperature'] + " °C" +
              '<br/><small><i>Sample Time :</i> ' + data.rivers[river]['date-and-time'] + '</small>' +
              '<button type="button" class="btn btn-primary more-infos" data-river="'+data.rivers[river]['station-number']+'"  >More infos</button>' + " " +
              '<button type="button" class="btn btn-warning alert-me" data-river="'+data.rivers[river]['station-number']+'" >Alert me</button>';


          var marker = new L.marker(L.latLng(parseFloat(data.rivers[river].latitude), parseFloat(data.rivers[river].longitude)),{title:data.rivers[river]['station-number']});
          marker.bindPopup(popup);
          NProgress.inc();
          markersCluster.addLayer(marker);
      macarte.addLayer(markersCluster);
      NProgress.done();
  }
}

// Get the river
function getRivers(riverinformations) {
  let uri = 'http://127.0.0.1:5000/rivers';
  NProgress.start();
  $.getJSON(uri, function(data){
      TabRivers = data;
      riverinformations(data);
});
  NProgress.done();
}

function filterRiverTemperature(id){
    var dictRivers = []
    markersCluster.clearLayers();
    NProgress.start();

    for (let river in TabRivers.rivers) {
        if(parseInt(TabRivers.rivers[river].temperature) > id){
            dictRivers.push(TabRivers.rivers[river]);
        }
    }
    var dictRiversFiltered = {
        rivers : dictRivers
    };
    fillDataInRiverMarker(dictRiversFiltered);
    NProgress.done();
}


