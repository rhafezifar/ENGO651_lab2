document.addEventListener('DOMContentLoaded', function(){
	var mymap = L.map('mapid').setView([51.0447, -114.0719], 13);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox/streets-v11',
	    tileSize: 512,
	    zoomOffset: -1,
	    accessToken: 'pk.eyJ1IjoicmF5ZWhlIiwiYSI6ImNrbHZ5NHMyejBkdXcyc214OHlvNmhrZG0ifQ.KXVOh3T-0PdiPnVQ5iMCCQ'
	}).addTo(mymap);

	var marker = L.marker([51.0447, -114.0719]).addTo(mymap);
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

	document.querySelector('button').onclick = function(){
		const request = new XMLHttpRequest();
		let url = `https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate >= '2020-01-21' and issueddate <= '2020-01-25'`
		request.open('GET', url);
		request.onload = function() {
			const data = JSON.parse(request.responseText);
			console.log("data loaded");
			console.log(data);
			for (let permit of data.features){
				console.log(permit);
				console.log(permit.properties.issueddate);
				console.log(permit.properties.originaladdress);

				const geojsonMarkerOptions = {
					radius: 6,
					fillColor: "#8442f5",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.5
				};

				L.geoJSON(permit, {
					onEachFeature: function (feature, layer) {
						layer.bindPopup(feature.properties.originaladdress);
					},
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, geojsonMarkerOptions);
					}
				}).addTo(mymap);

			}
		};
		request.send();
	};
});