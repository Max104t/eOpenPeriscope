var MapController = {
    init: function(parent) {

        $(document.head).append('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />',
        '<link rel="stylesheet" href="http://leaflet.github.io/Leaflet.markercluster/dist/MarkerCluster.css" />');
    var mapList = $('<div class="split"/>');
    parent.append($('<div id="Map"/>').append('<div id="map" class="split"/>',mapList));
    // Set center
    map = L.map('map', {zoomControl: false}).setView([0, 0], 2);

    // Layers list
    var tileLayers = {
        "Open Street Map": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; OpenStreetMap'
        }).addTo(map),
        "Mapbox": L.tileLayer('http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWZ4IiwiYSI6IjNFcEppQlkifQ.qQjCuUBY9_739UXnMknMVw', {
        attribution: 'Map data &copy; OpenStreetMap'
        }),
        "Google": L.tileLayer('http://mt{s}.google.com/vt/x={x}&y={y}&z={z}', {
            subdomains: '123',
            attribution: 'Map data &copy; Google'
        })
    };
    L.control.layers(tileLayers).addTo(map);
    // Split panel opener
    var splitPanelEnabled = false;
    L.Control.PanelButton = L.Control.extend({
        onAdd: function(amap) {
            return $('<div class="leaflet-control-layers leaflet-control"/>')
                .append($('<a class="bullets" title="Toggle broadcasts list"/>').click(function(){
                    if (splitPanelEnabled) {
                        $('.gutter').remove();
                        $(amap.getContainer()).css('width','');
                        mapList.css('width','0');
                    } else {
                        Split($('.split'), {
                            sizes: [80, 20],
                            minSize: [100, 100]
                        });
                    }
                    splitPanelEnabled = !splitPanelEnabled;
                }))
                .get(0);
        },

        onRemove: function(amap) {
        }
    });
    new L.Control.PanelButton().addTo(map);
    // Search
    var searcher = false;
    L.Control.Searcher = L.Control.extend({
        onAdd: function (amap) {
            return $('<div class="leaflet-control searcher"/>')
                .append($('<input type="text" placeholder="Search..."/>')
                    .mousemove(function () {return false})
                    .dblclick(function () {return false})
                    .keypress(function (e) {
                        if (e.keyCode == 13) {
                            var $this = $(this);
                            $.get('https://maps.googleapis.com/maps/api/geocode/json', {
                                address: $(this).val(),
                                key: 'AIzaSyChqVpIwX4UYEh-1Rza_OqTl1OwYfupWBE'  // key quota is 2500 requests per day \_(-_-)_/
                            }, function (r) {
                                if (r.results.length) {
                                    amap.fitBounds([
                                        [r.results[0].geometry.viewport.southwest.lat, r.results[0].geometry.viewport.southwest.lng],
                                        [r.results[0].geometry.viewport.northeast.lat, r.results[0].geometry.viewport.northeast.lng]
                                    ]);
                                } else {
                                    $this.css('transition', '');
                                    $this.css('color', 'red');
                                    setTimeout(function () {
                                        $this.css('transition', 'color 4s ease-out');
                                        $this.css('color', '');
                                    }, 100);
                                }
                            });
                            return false;
                        }
                    }))
                .get(0);
        }
    });
    new L.Control.Searcher({position: 'topleft'}).addTo(map);
    new L.Control.Zoom().addTo(map);
    // Cluster icons
    var iconCreate = function (prefix) {
        return function (cluster) {
            var childCount = cluster.getChildCount();
            var c = ' ' + prefix + '-cluster-';
            if (childCount < 10) {
                c += 'small';
            } else if (childCount < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }
            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: 'marker-cluster' + c,
                iconSize: new L.Point(40, 40)
            });
        };
    };
    var replay = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 16,
        singleMarkerMode: true,
        iconCreateFunction: iconCreate('replay')
    }).addTo(map);
    var live = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 16,
        singleMarkerMode: true,
        iconCreateFunction: iconCreate('live')
    }).addTo(map);
    var refreshMap = function () {
        //if (e && e.hard === false) return;    // zoom change case
        var mapBounds = map.getBounds();
        clearXHR();
        if (mapBounds._northEast.lat == mapBounds._southWest.lat && mapBounds._northEast.lng == mapBounds._southWest.lng)
            console.warn('Map is out of mind');
        PeriscopeWrapper.V2_POST_Api('mapGeoBroadcastFeed', {
            "include_replay": true,
            "p1_lat": mapBounds._northEast.lat,
            "p1_lng": mapBounds._northEast.lng,
            "p2_lat": mapBounds._southWest.lat,
            "p2_lng": mapBounds._southWest.lng
        }, function (r) {
            var openLL; // for preventing of closing opened popup
            live.eachLayer(function (layer) {
                if (layer.getPopup()._isOpen)
                    openLL = layer.getLatLng();
                else
                    live.removeLayer(layer);
            });
            replay.eachLayer(function (layer) {
                if (layer.getPopup()._isOpen)
                    openLL = layer.getLatLng();
                else
                    replay.removeLayer(layer);
            });
            // adding markers
            for (var i = 0; i < r.length; i++) {
                var stream = r[i];
                var marker = L.marker(new L.LatLng(stream.ip_lat, stream.ip_lng), {title: stream.status || stream.user_display_name});
                if (!marker.getLatLng().equals(openLL)) {
                    var description = getDescription(stream);
                    marker.bindPopup(description);
                    marker.on('popupopen', getM3U.bind(null, stream.id, $(description)));
                    marker.on('popupopen', PeriscopeWrapper.V2_POST_Api.bind(null, 'getBroadcasts', {
                        broadcast_ids: [stream.id],
                        only_public_publish: true
                    }, function (info) {
                        $('.leaflet-popup-content .watching').text(info[0].n_watching + info[0].n_web_watching);
                    }));
                    marker.on('popupopen', function (e) {
                        var img = $(e.popup._content).find('img');
                        img.attr('src', img.attr('lazysrc'));
                        img.removeAttr('lazysrc');
                    });
                    (stream.state == 'RUNNING' ? live : replay).addLayer(marker);
                }
            }
            if (splitPanelEnabled)
                refreshList(mapList)(r);
        });
        var mapCenter = map.getCenter();
        history.replaceState({
            section: 'Map',
            param: mapCenter.lat + ',' + mapCenter.lng
        }, 'Map', '/Map/' + mapCenter.lat + ',' + mapCenter.lng);
    };
    if (!history.state.param) {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(function (position) {
                map.setView([position.coords.latitude, position.coords.longitude], 11);
                refreshMap();
            }, function(){
                refreshMap();
            });
    }
    map.on('moveend', refreshMap);
    lazyLoad(mapList);
    }
}
