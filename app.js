var conf = config;
//Géo coding
let $adress = [];
let map;
let $location = document.getElementById("locationInput");
let $label = document.getElementById("label");
let $error = document.getElementById("error");
var bounds = new google.maps.LatLngBounds();
let $coords = [];
var markers = [];
let $moreInfo = document.getElementById("moreInfo")

//check on submit
// document.getElementById("form").addEventListener("submit", add);
document.getElementById("sub").addEventListener("click", add);

function add(e) {

  $error.innerHTML = "";
  //get value form
  let $value = $location.value;
  let $check = $adress.indexOf($value);

  if ($check === -1) {  //cheking if the address is already in
    $adress.push($value);
    if($adress.length === 2){ //when the second itinay is submit, ask the type of itinary
        $moreInfo.className = 'd-flex flex-column';
        document.getElementById("choice").addEventListener("click", function() {
            let $params = document.getElementById("choice").value
            $location.innerHTML = "";
            geocode($adress, $value, $params);
        })
    }else{ 
        $location.innerHTML = "";
        geocode($adress, $value);
    }
  } else {
    $error.innerHTML = "the adress is already in";
  }
}

async function geocode($list, $value, $params) {
  //initalize the api request
  await axios
    .get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address: $list[$list.length - 1],
        key: config.APIKEY,
      },
    })
    .then(function (response) {

      if (response.data.results == 0) {
        // checking if the address is valid for the api
        let pos = $adress.indexOf($value);
        let remove = $adress.splice(pos, 1);

        $error.innerHTML = "Adress unfindable";
      } else {
        let formattedAdress = response.data.results[0].formatted_address;
        let mainAdress =
          response.data.results[0].address_components[0].long_name;
        let lat = response.data.results[0].geometry.location.lat;
        let lng = response.data.results[0].geometry.location.lng;

        let formattedAddressOutput = `<li class='list-group-item'>
                    adress : ${formattedAdress}<span class="ml-3 btn btn-danger" id="suppr">D</span>
                </li>`;

        document.getElementById(
          "formattedAdresse"
        ).innerHTML += formattedAddressOutput;

        //initialize markers array
        var marker = {
          coords: { lat: lat, lng: lng },
          title: mainAdress,
        };
        markers.push(marker);

        push($list, $params);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

//initialize the map
const push = ($list, $params) => {
  var options = {
    zoom: 1,
    center: { lat: 48.856614, lng: 2.3522219 },
  };

  var map = new google.maps.Map(document.getElementById("map"), options);

  //in case of just one address
  $list.map((n) => initMap(markers, map));

  //if there are more than one adress, set up a line
  if ($list.length > 1) {
    //get the object coords for every adress
    for (let i = 0; i < markers.length; i++) {
      $coords.push(markers[i].coords);
    }
    var options = {
      zoom: 4,
      center: markers[1].coords,
    };

    var map = new google.maps.Map(document.getElementById("map"), options);

      // Instantiate a directions service.
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer({
  map: map,
  });
    if($params === "DRIVING"){
      calculateAndDisplayRouteForDriving(
        directionsService,
        directionsDisplay,
        $coords[0],
        $coords[1], 
      );
    }else if($params === "BICYCLING"){
      calculateAndDisplayRouteForBicycling(
        directionsService,
        directionsDisplay,
        $coords[0],
        $coords[1], 
      );
    }else if ($params === "TRANSIT"){
      calculateAndDisplayRouteForTransit(
        directionsService,
        directionsDisplay,
        $coords[0],
        $coords[1], 
      );
    }else if($params === "WALKING"){
      calculateAndDisplayRouteForWalking(
        directionsService,
        directionsDisplay,
        $coords[0],
        $coords[1], 
      );
    }
   

    //initialize the polyline
    var line = new google.maps.Polyline({
      path: $coords,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    line.setMap(map);
  }
};

const initMap = (markers, map) => {
  let coords = markers[markers.length - 1].coords;

  var options = {
    zoom: 4,
    center: coords,
  };

  var map = new google.maps.Map(document.getElementById("map"), options);

  //loop for run all the markers array
  for (var i = 0; i < markers.length; i++) {
    addMarker(markers[i]);
  }

  //function for displaying the markers
  function addMarker(props) {
    var marker = new google.maps.Marker({
      position: props.coords,
      map: map,
      title: props.title,
      animation: google.maps.Animation.DROP,
    });

    // if title is not null
    if (props.title) {
      var infoMarker = new google.maps.InfoWindow({
        content: props.title,
      });
      marker.addListener("click", function () {
        infoMarker.open(map, marker);
      });
    }
  }
  prepareForItinary();
};

function prepareForItinary(){
    //initalize html for itinary
    $label.innerHTML = "Enter a second address to see the itinary";
    document.getElementById("sub").innerHTML = "<button id='subForItinary'class='btn-block btn btn-primary'>Enter second address for itinary</button>";
    document.getElementById("subForItinary").addEventListener("click", add)
}


function calculateAndDisplayRouteForDriving(
  directionsService,
  directionsDisplay,
  pointA,
  pointB, 
  $params
) {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      // travelMode: google.maps.TravelMode + '.' + $params,
      travelMode: google.maps.TravelMode.DRIVING
    },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        console.log(response)
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function calculateAndDisplayRouteForBicycling(
  directionsService,
  directionsDisplay,
  pointA,
  pointB, 
  $params
) {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      // travelMode: google.maps.TravelMode + '.' + $params,
      travelMode: google.maps.TravelMode.BYCYCLING
    },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        console.log(response)
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function calculateAndDisplayRouteForTransit(
  directionsService,
  directionsDisplay,
  pointA,
  pointB, 
  $params
) {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      // travelMode: google.maps.TravelMode + '.' + $params,
      travelMode: google.maps.TravelMode.TRANSIT
    },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        console.log(response)
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function calculateAndDisplayRouteForWalking(
  directionsService,
  directionsDisplay,
  pointA,
  pointB, 
  $params
) {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      // travelMode: google.maps.TravelMode + '.' + $params,
      travelMode: google.maps.TravelMode.WALKING
    },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        console.log(response)
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}
