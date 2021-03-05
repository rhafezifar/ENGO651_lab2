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

    var oms = new OverlappingMarkerSpiderfier(mymap);
    oms.addListener('spiderfy', function(markers) {
        mymap.closePopup();
    });

    var circleIcon = L.icon({
        iconUrl: 'icon.png',
        iconSize:     [16, 16], // size of the icon
        iconAnchor:   [8, 8], // point of the icon which will correspond to marker's location
        popupAnchor:  [8, 8] // point from which the popup should open relative to the iconAnchor
    });

    document.querySelector('button').onclick = function () {
        const request = new XMLHttpRequest();
        const fromdate = document.querySelector('#from-datepicker').value;
        const todate = document.querySelector('#to-datepicker').value;
        if (!fromdate || !todate){
        	alert("From and/or To date is not selected!");
        	return false;
		}
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
                var coor = permit.geometry.coordinates;
                var latLong = [coor[1], coor[0]];
                var marker = L.marker(latLong, {icon: circleIcon}).addTo(mymap);
                marker.desc = popupinfo;
                var popup = new L.Popup();
                oms.addListener('click', function(marker) {
                    popup.setContent(marker.desc);
                    popup.setLatLng(marker.getLatLng());
                    mymap.openPopup(popup);
                });
                mymap.addLayer(marker);
                oms.addMarker(marker);
            }
        };
        request.send();
    };
});