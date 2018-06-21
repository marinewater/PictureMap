import * as ol from 'ol';

declare const EXIF: any;


interface LonLat {
    Latitude: number,
    Longitude: number
}

const image = (<HTMLInputElement>document.getElementById('image' ));

function getData() {

    EXIF.getData( image.files[ 0 ], function() {

        const allMetaData = EXIF.getAllTags( this );
        const gps: LonLat[] = [{
            Latitude: ConvertDMSToDD(
                parseInt( allMetaData.GPSLatitude[0], 10 ),
                parseInt( allMetaData.GPSLatitude[1], 10 ),
                parseFloat( allMetaData.GPSLatitude[2] ),
                allMetaData.GPSLatitudeRef
            ),
            Longitude: ConvertDMSToDD(
                parseInt( allMetaData.GPSLongitude[0], 10 ),
                parseInt( allMetaData.GPSLongitude[1], 10 ),
                parseFloat( allMetaData.GPSLongitude[2] ),
                allMetaData.GPSLongitudeRef
            )
        }];

        renderMap( gps );

    });

}

function ConvertDMSToDD( degrees: number, minutes: number, seconds: number, direction: string ) {

    let dd = degrees + minutes / 60 + seconds / ( 60 * 60 );

    if ( direction == 'S' || direction == 'W' ) {
        dd *= -1;
    }

    return dd;

}

function renderMap( lon_lat: LonLat[] ) {

    const marker = new ol.default.Feature({
        type: 'icon',
        geometry: new ol.default.geom.Point( [ lon_lat[0].Longitude, lon_lat[0].Latitude ] )
    });

    const styles: any = {
        'icon': new ol.default.style.Style({
            image: new ol.default.style.Icon({
                anchor: [0.5, 1],
                src: 'https://openlayers.org/en/v4.6.5/examples/data/icon.png'
            })
        }),
    };

    const vectorLayer = new ol.default.layer.Vector({
        source: new ol.default.source.Vector({
            features: [ marker ]
        }),
        style: function(feature: any) {

            return styles[feature.get('type')];
        }
    });

    const center: [number, number] = [-5639523.95, -3501274.52];

    const map = new ol.default.Map({
        target: 'map',
        loadTilesWhileAnimating: true,
        view: new ol.default.View({
            center: ol.default.proj.fromLonLat( center ),
            zoom: 10,
            minZoom: 2,
            maxZoom: 19
        }),
        layers: [,
            new ol.default.layer.Tile({
                source: new ol.default.source.OSM()
            }),
            vectorLayer
        ]
    });
    console.log( 'b' );

}

image.addEventListener( 'change', getData );