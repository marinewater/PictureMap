/**
 * creates a Blob from the provided buffer and returns the blob url
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function blobFromBuffer( buffer: ArrayBuffer ): string {

    const arrayBufferView = new Uint8Array( buffer );
    const blob = new Blob( [ arrayBufferView ], { type: 'image/jpeg' } );

    const urlCreator = window.URL || ( window as any ).webkitURL;
    return urlCreator.createObjectURL( blob );

}
