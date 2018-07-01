import { IPicture } from './exif_map';

/**
 * removes all child nodes from the provided node
 * @param {Node} node
 */
export function removeChildren( node: Node ) {

    while ( node.hasChildNodes() ) {
        node.removeChild( node.lastChild );
    }

}

/**
 * adds thumbnails to the image grid
 * @param map
 * @param {HTMLDivElement} imageGrid
 * @param {IPicture[]} pictures
 */
export function addPictures( map: any, imageGrid: HTMLDivElement, pictures: IPicture[] ) {

    removeChildren( imageGrid );

    pictures.forEach( function( p ) {

        const div = document.createElement( 'div' );
        div.classList.add( 'image' );
        div.appendChild( pictureFromBlob( p ) );

        if ( p.Marker !== null ) {
            div.addEventListener( 'click', function() {

                map.setView( p.Marker.getLatLng(), 13, {
                    animate: true
                } );

                p.Marker.openPopup();

            } );
        }
        else {
            div.classList.add( 'no-gps' );
        }

        imageGrid.appendChild( div );

    } );

}

/**
 * creates an image element which displays the provided Blob
 * @param {IPicture} picture
 * @returns {HTMLImageElement}
 */
export function pictureFromBlob( picture: IPicture ): HTMLImageElement {

    const img = document.createElement( 'img' );
    img.src = picture.BlobUrl;
    img.alt = picture.Name;
    img.title = picture.Name;

    return img;

}

/**
 * shows the loading bar that indicates that pictures are being processed
 * @param {boolean} show
 */
export function show_loader( show: boolean ) {

    const loader = document.querySelector( '.loader' );
    if ( show === true ) {
        loader.classList.remove( 'hidden' );
    }
    else {
        loader.classList.add( 'hidden' );
    }

}

/**
 * greys out the file input element and blocks access to it
 * enables it if disable = false
 * @param {boolean} [disable=true]
 */
export function disableFileInput( disable = true ) {

    const fileInput = document.getElementById( 'image' ) as HTMLInputElement;
    fileInput.disabled = disable;

}

/**
 * shows modal and displays large image preview and exif data
 * @param {IPicture} picture
 */
export function showModal( picture: IPicture ) {

    const modal = document.querySelector( '.modal' ) as HTMLDivElement;

    const modalImageContainer = document.querySelector( '.modal-image-container' ) as HTMLDivElement;
    removeChildren( modalImageContainer );

    const image = pictureFromBlob( picture );
    image.classList.add( 'modal-image' );
    modalImageContainer.appendChild( image );

    const heading = document.querySelector( '.modal-heading h1' ) as HTMLHeadingElement;
    heading.innerText = picture.Name;

    const modelData = document.querySelector( '.modal-data' ) as HTMLDivElement;
    removeChildren( modelData );
    modelData.appendChild( formatExifData( picture ) );

    modal.style.visibility = 'visible';

    const modalClose = document.querySelector( '.modal-close > .close-icon' ) as HTMLDivElement;
    modalClose.addEventListener( 'click', function( e ) {

        e.preventDefault();
        hideModal();

    } );

}

/**
 * creates html list for exif data
 * @param {IPicture} picture
 * @returns {HTMLUListElement}
 */
function formatExifData( picture: IPicture ): HTMLUListElement {

    const ul = document.createElement( 'ul' );

    for ( const key in picture.MetaData ) {
        if ( picture.MetaData.hasOwnProperty( key ) ) {

            const li = document.createElement( 'li' );

            const b = document.createElement( 'b' );
            const tagName = document.createTextNode( `${key}: ` );
            b.appendChild( tagName );
            li.appendChild( b );

            let tagValue: string;

            if ( Array.isArray( picture.MetaData[ key ] ) ) {
                tagValue = ( picture.MetaData[ key ] as any[] ).join( ', ' );
            }
            else if ( typeof picture.MetaData[ key ] === 'object' ) {
                tagValue = JSON.stringify( picture.MetaData[ key ], null, 4 );
            }
            else {
                tagValue = picture.MetaData[ key ].toString();
            }

            li.appendChild( document.createTextNode( tagValue ) );

            ul.appendChild( li );

        }
    }

    return ul;
}

/**
 * hides the picture/exif data modal
 */
function hideModal() {

    const modal = document.querySelector( '.modal' ) as HTMLDivElement;
    modal.style.visibility = 'hidden';

}
