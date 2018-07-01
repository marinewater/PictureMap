import { ITags } from 'exif-ts/index';
import { blobFromBuffer } from './binary';
import { addPictures, disableFileInput, pictureFromBlob, show_loader, showModal } from './dom';
import { IImageData } from './worker';

interface ILonLat {
    Latitude: number;
    Longitude: number;
}

interface IPosition {
    LonLat: ILonLat;
    Name: string;
    BinaryImage: ArrayBuffer;
    MetaData: ITags;
}

export interface IPicture {
    Name: string;
    Marker: any;
    BlobUrl: string;
    MetaData: ITags;
}

declare const L: any;

export class ExifMap {

    /**
     * converts a geo location from degrees, minutes, and seconds to decimal coordinates
     * @param {number} degrees
     * @param {number} minutes
     * @param {number} seconds
     * @param {string} direction
     * @returns {number}
     * @private
     */
    private static _convertDMSToDD( degrees: number, minutes: number, seconds: number, direction: string ): number {

        let dd = degrees + minutes / 60 + seconds / ( 60 * 60 );

        if ( direction === 'S' || direction === 'W' ) {
            dd *= -1;
        }

        return dd;

    }

    /**
     * extracts geo data from EXIF tags
     * @param metaData
     * @returns {ILonLat | null}
     * @private
     */
    private static _parseGeoData( metaData: any ): ILonLat | null {

        if ( typeof metaData.GPSLatitude === 'undefined' ||
            typeof metaData.GPSLatitudeRef === 'undefined' ||
            typeof metaData.GPSLongitude === 'undefined' ||
            typeof metaData.GPSLongitudeRef === 'undefined'
        ) {
            return null;
        }
        else {
            return {
                Latitude: ExifMap._convertDMSToDD(
                    parseInt( metaData.GPSLatitude[ 0 ], 10 ),
                    parseInt( metaData.GPSLatitude[ 1 ], 10 ),
                    parseFloat( metaData.GPSLatitude[ 2 ] ),
                    metaData.GPSLatitudeRef
                ),
                Longitude: ExifMap._convertDMSToDD(
                    parseInt( metaData.GPSLongitude[ 0 ], 10 ),
                    parseInt( metaData.GPSLongitude[ 1 ], 10 ),
                    parseFloat( metaData.GPSLongitude[ 2 ] ),
                    metaData.GPSLongitudeRef
                )
            };
        }
    }

    private readonly _imageInputElement: HTMLInputElement;
    private readonly _imageGrid: HTMLDivElement;
    private readonly _map: any;
    private readonly _pictures: IPicture[] = [];

    /**
     * @param {HTMLInputElement} inputElement
     * @param {HTMLDivElement} imageGrid
     * @param {string} mapId
     * @constructor
     */
    constructor( inputElement: HTMLInputElement, imageGrid: HTMLDivElement, mapId: string ) {

        this._imageInputElement = inputElement;
        this._imageGrid = imageGrid;

        this._map = L.map( mapId );
        L.tileLayer( 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under ' +
            '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
            'Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ' +
            '<a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
            maxZoom: 16
        } ).addTo( this._map );
        this._map.setView( [ 51.502654, -0.124225 ], 10 );

    }

    /**
     * gets images from input file, extracts the exif data and adds them as marker to the map
     * @returns {Promise<void>}
     */
    public getData(): Promise<void> {

        disableFileInput();
        show_loader( true );
        const exifData: File[] = [];

        for ( const imageFile of this._imageInputElement.files ) {
            exifData.push( imageFile );
        }

        return this._getImageData( exifData )
            .then( ( lonLat ) => this._renderMap( lonLat ) )
            .then( () => this._list_images() )
            .then( () => show_loader( false ) )
            .then( () => disableFileInput( false ) );

    }

    /**
     * zooms and pans the map to make all markers visible
     */
    public zoomToAll() {

        const filteredPictures = this._pictures.filter( ( p ) => p.Marker !== null );
        if ( filteredPictures.length > 0 ) {
            const markers = filteredPictures.map( ( p ) => p.Marker );
            const group = new L.featureGroup( markers );

            this._map.fitBounds( group.getBounds() );
        }

    }

    /**
     * sends files to a webworker to extract EXIF data
     * @param {File[]} files
     * @returns {Promise<IPosition[]>}
     * @private
     */
    private _getImageData( files: File[] ): Promise<IPosition[]> {

        return new Promise( function( resolve, reject ) {

            const worker = new Worker( 'dist/worker.min.js' );

            worker.onmessage = ( e ) => {
                resolve( e.data.map( function( i: IImageData ) {
                    return {
                        BinaryImage: i.binary,
                        LonLat: ExifMap._parseGeoData( i.meta_data ),
                        MetaData: i.meta_data,
                        Name: i.file_name
                    } as IPosition;
                } ) );
                worker.terminate();
            };
            worker.onerror = ( error ) => {
                reject( error );
                worker.terminate();
            };

            worker.postMessage( files );

        } );

    }

    /**
     * displays thumbnail images on the grid
     * @private
     */
    private _list_images() {

        const pictures = this._pictures
            .sort( ( a, b ) => a.Name.localeCompare( b.Name, undefined, { sensitivity: 'base' } ) );

        addPictures( this._map, this._imageGrid, pictures );

    }

    /**
     * adds the markers to the map
     * @param {IPosition[]} positions
     * @private
     */
    private _renderMap( positions: IPosition[] ) {

        const _this = this;

        const markers: any[] = [];

        positions.forEach( function( position ) {

            const picture: IPicture = {
                BlobUrl: blobFromBuffer( position.BinaryImage ),
                Marker: null,
                MetaData: position.MetaData,
                Name: position.Name
            };

            if ( position.LonLat !== null ) {

                const div = document.createElement( 'div' );

                const p = document.createElement( 'p' );
                const text = document.createTextNode( position.Name );
                p.appendChild( text );
                div.appendChild( p );

                const image = pictureFromBlob( picture );
                image.addEventListener( 'click', () => showModal( picture ) );
                div.appendChild( image );

                const marker = L.marker( [ position.LonLat.Latitude, position.LonLat.Longitude ] ).addTo( _this._map );
                marker
                    .bindPopup( div )
                    .openPopup();
                markers.push( marker );
                picture.Marker = marker;
            }

            _this._pictures.push( picture );

        } );

        if ( markers.length > 0 ) {
            const group = new L.featureGroup( markers );
            this._map.fitBounds( group.getBounds() );
        }

    }

}
