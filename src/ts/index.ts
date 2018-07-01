import { ExifMap } from './exif_map';

function main() {

    const image = document.getElementById( 'image' ) as HTMLInputElement;
    const imageGrid = document.getElementById( 'image-grid' ) as HTMLDivElement;
    const exifMap = new ExifMap( image, imageGrid, 'map' );

    image.addEventListener( 'change', () => exifMap.getData() );
    ( document.getElementById( 'fit-all' ) as HTMLButtonElement )
        .addEventListener( 'click', function( e ) {

        e.preventDefault();
        exifMap.zoomToAll();

    } );

}

window.addEventListener( 'DOMContentLoaded', () => main(), true );
