(function (ol) {
'use strict';

var ol__default = ol['default'];

var image = document.getElementById('image');
function getData() {
    EXIF.getData(image.files[0], function () {
        var allMetaData = EXIF.getAllTags(this);
        var gps = [{
                Latitude: ConvertDMSToDD(parseInt(allMetaData.GPSLatitude[0], 10), parseInt(allMetaData.GPSLatitude[1], 10), parseFloat(allMetaData.GPSLatitude[2]), allMetaData.GPSLatitudeRef),
                Longitude: ConvertDMSToDD(parseInt(allMetaData.GPSLongitude[0], 10), parseInt(allMetaData.GPSLongitude[1], 10), parseFloat(allMetaData.GPSLongitude[2]), allMetaData.GPSLongitudeRef)
            }];
        renderMap(gps);
    });
}
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes / 60 + seconds / (60 * 60);
    if (direction == 'S' || direction == 'W') {
        dd *= -1;
    }
    return dd;
}
function renderMap(lon_lat) {
    var marker = new ol__default.Feature({
        type: 'icon',
        geometry: new ol__default.geom.Point([lon_lat[0].Longitude, lon_lat[0].Latitude])
    });
    var styles = {
        'icon': new ol__default.style.Style({
            image: new ol__default.style.Icon({
                anchor: [0.5, 1],
                src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
            })
        }),
    };
    var vectorLayer = new ol__default.layer.Vector({
        source: new ol__default.source.Vector({
            features: [marker]
        }),
        style: function (feature) {
            return styles[feature.get('type')];
        }
    });
    var center = [-5639523.95, -3501274.52];
    var map = new ol__default.Map({
        target: 'map',
        loadTilesWhileAnimating: true,
        view: new ol__default.View({
            center: ol__default.proj.fromLonLat(center),
            zoom: 10,
            minZoom: 2,
            maxZoom: 19
        }),
        layers: [,
            new ol__default.layer.Tile({
                source: new ol__default.source.OSM()
            }),
            vectorLayer
        ]
    });
    console.log('b');
}
image.addEventListener('change', getData);

}(ol));
