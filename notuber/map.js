var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);
var myOptions =  {
	zoom: 18,
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
var infowindow = new google.maps.InfoWindow();

function init()
{
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	getMyLocation();
}

function getMyLocation()
{
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude; 	
			myLng = position.coords.longitude;
			connect_database("s4lIFLCg", myLat, myLng);
		});
	}
	else {
		alert("Geolocation is not supported by your web browser. What a shame!");
	}
}

function render_MyLocation(image)
{
	me = new google.maps.LatLng(myLat, myLng);
	map.panTo(me);
	marker = new google.maps.Marker({
		position: me,
		title: "I'm here!",
		icon: image
	});
	marker.setMap(map);

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent("My username: s4lIFLCg");
		infowindow.open(map, this);
	});
}

function connect_database(username, mylat, mylng)
{
	request.open("POST", "https://defense-in-derpth.herokuapp.com/submit", true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    
	request.onreadystatechange = function () {
		if (request.readyState == 4 && request.status == 200) {
			data = request.responseText;
			parsed = JSON.parse(data);
			if (parsed["vehicles"]) {
				for (i = 0; i < parsed["vehicles"].length; i++) {
					var Otherspic = "black_car.png";
					render_MyLocation("me.png");
					render_OthersLocation(parsed["vehicles"][i], Otherspic);
				}
			}
			if (parsed["passengers"]) {
				for (i = 0; i < parsed["passengers"].length; i++) {
					var Otherspic = "passenger.png";
					render_MyLocation("black_car.png");
					render_OthersLocation(parsed["passengers"][i], Otherspic);
				}
			}
		}
	}
	request.send("username=" + username + "&lat=" + mylat + "&lng=" + mylng);
}

function render_OthersLocation(info, pic) 
{
	var others = new google.maps.LatLng(info["lat"], info["lng"]);
	var marker = new google.maps.Marker({
		position: others,
		icon: pic
	});
	marker.setMap(map);
	var distance = calculate_distance(info["lat"], info["lng"]);

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent("Username: " + info["username"] + " is " + distance + " miles away!");
		infowindow.open(map, this);
	});
}	

function calculate_distance(lat, lng)
{
	Number.prototype.toRadians = function() {
		return this * Math.PI / 180;
	}
	var R = 3961; // in miles
	var φ1 = myLat.toRadians();
	var φ2 = lat.toRadians();
	var Δφ = (myLat-lat).toRadians();
	var Δλ = (myLat-lat).toRadians();
	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;

	return d;
}

