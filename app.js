var conf = config;
//Géo coding
let $adress = [];
let map;
let $location = document.getElementById("locationInput");
let $error = document.getElementById("error");
var bounds = new google.maps.LatLngBounds();
let $coords = [];
var markers = [];

//check on submit
// document.getElementById("form").addEventListener("submit", add);
document.getElementById("sub").addEventListener("click", add);

function add(e) {
  e.preventDefault();
  $error.innerHTML = "";
  //get value form
  let $value = $location.value;
  let $check = $adress.indexOf($value);

  if ($check === -1) {
    //cheking if the address is already in
    $adress.push($value);
    $location.innerHTML = "";
    geocode($adress, $value);
  } else {
    $error.innerHTML = "the adress is already in";
  }
}

async function geocode($list, $value) {
  //initalize the api request
  await axios
    .get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address: $list[$list.length - 1],
        key: config.APIKEY,
      },
    })
    .then(function (response) {
      //formatted Adress
      console.log(response);
      if (response.data.results == 0) {
        // checking if the address is valid
        let pos = $adress.indexOf($value);
        let remove = $adress.splice(pos, 1);
        $error.innerHTML = "L'adress n'est pas valide";
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

        push($list);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

//initialize the map
const push = ($list) => {
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
};

// function calculateAndDisplayRoute(
//   directionsService,
//   directionsDisplay,
//   pointA,
//   pointB
// ) {
//   directionsService.route(
//     {
//       origin: pointA,
//       destination: pointB,
//       travelMode: google.maps.TravelMode.DRIVING,
//     },
//     function (response, status) {
//       if (status == google.maps.DirectionsStatus.OK) {
//         directionsDisplay.setDirections(response);
//       } else {
//         window.alert("Directions request failed due to " + status);
//       }
//     }
//   );
// }
//   // Instantiate a directions service.
//   directionsService = new google.maps.DirectionsService();
//   directionsDisplay = new google.maps.DirectionsRenderer({
//   map: map,
//   });
//     calculateAndDisplayRoute(
//       directionsService,
//       directionsDisplay,
//       $coords[0],
//       $coords[1]
//     );