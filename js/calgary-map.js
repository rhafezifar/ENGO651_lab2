document.addEventListener('DOMContentLoaded', function () {
    $(function () {
        $("#from-datepicker").datepicker({dateFormat: "yy-mm-dd"});
    });
	$( function() {
		$( "#to-datepicker" ).datepicker({dateFormat: "yy-mm-dd"});
	} );

    var mymap = L.map('mapid').setView([51.0447, -114.0719], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoicmF5ZWhlIiwiYSI6ImNrbHZ5NHMyejBkdXcyc214OHlvNmhrZG0ifQ.KXVOh3T-0PdiPnVQ5iMCCQ'
    }).addTo(mymap);

    let markers = L.markerClusterGroup({
        removeOutsideVisibleBounds: false
    });
    mymap.addLayer(markers);

    document.querySelector('button').onclick = function () {
        const request = new XMLHttpRequest();
        const fromdate = document.querySelector('#from-datepicker').value;
        const todate = document.querySelector('#to-datepicker').value;
        if (!fromdate || !todate){
        	alert("From and/or To date is not selected!");
        	return false;
		}
        markers.clearLayers();
        let url = `https://data.calgary.ca/resource/c2es-76ed.geojson?$where=issueddate >= '${fromdate}' and issueddate <= '${todate}'`
        request.open('GET', url);
        request.onload = function () {
            const data = JSON.parse(request.responseText);
            console.log("data loaded");
            console.log(data);
            for (let permit of data.features) {
                console.log(permit);
                console.log(permit.properties.issueddate);
                console.log(permit.properties.originaladdress);

                const p = permit.properties;
                const issuedate = p.issueddate.slice(0, 10);
                const popupinfo = `Issue date: ${issuedate}<br>Work Class Group: ${p.workclassgroup}<br>Contractor Name: ${p.contractorname}<br>Community Name: ${p.communityname}<br>Original Address: ${p.originaladdress}`;
                if (!permit.geometry){
                    continue;
                }
                const geojsonMarkerOptions = {
                    radius: 6,
                    fillColor: "#8442f5",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                };
                let coor = permit.geometry.coordinates;
                let latLong = [coor[1], coor[0]];
                let marker = L.circleMarker(latLong, geojsonMarkerOptions);
                marker.desc = popupinfo;
                marker.bindPopup(popupinfo);
                markers.addLayer(marker);
            }
        };
        request.send();
    };
});