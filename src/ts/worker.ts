import { Exif, getBinaryData, ITags } from 'exif-ts';

declare const postMessage: ( images: any ) => void;

export interface IImageData {
    meta_data: ITags;
    file_name: string;
    binary: ArrayBuffer;
}

/**
 * extracts exif data from image
 * @param {File} image
 * @returns {Promise<IImageData>}
 */
function getImageData( image: File ): Promise<IImageData> {

    return getBinaryData( image )
        .then( function( buffer ) {

            const exif = new Exif( buffer );
            exif.getData();

            const tags = exif.getAllTags();
            return {
                binary: buffer,
                file_name: image.name,
                meta_data: tags
            };

        } );

}

onmessage = function( e ) {

    const queue = e.data.map( ( i: File ) => getImageData( i ) );
    Promise.all( queue )
        .then( function( images ) {
            postMessage( {
                images,
                type: 'success'
            } );
        } )
        .catch( function( error ) {
            postMessage( {
                error,
                type: 'error'
            } );
        } );

};
