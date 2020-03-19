/*
 * Packs a raw gltf file with .bin buffers and .png textures into a packed glb binary
 */

const path = require('path')
const GLB = require('./lib/glb')

const BASE64_HEADER = 'data:application/octet-stream;base64,'
/*
 * Reads a GLTF file into a GLB data model
 * This will pack all the binary assets into one buffer
 * gltfFile is a json string
 * binaryFileMap is a filename->buffer map
 * options: {
    convertPNG: whether pngs will be converted to jpgs
    makeUnlit: Add the KHR_materials_unlit flag to all materials
 }
 */
module.exports = function(gltfFile, binaryFileMap, options) {
  options = options || {
    convertPNG: false,
    makeUnlit: false
  }
  const json = gltfFile

  if (options.makeUnlit) {
    json.extensionsUsed = json.extensionsUsed || []
    json.extensionsUsed.push('KHR_materials_unlit')
    
    json.materials.forEach(material => {
      material.extensions = material.extensions || {}
      material.extensions.KHR_materials_unlit = {}
    })
  }
  
  let bufferIndex = 0

  const uriToBuffer = (uri) => {
    if (uri.indexOf(BASE64_HEADER) == 0) {
      const base64 = uri.substring(BASE64_HEADER.length)
      return Buffer.from(base64, 'base64')
    }
    
    return binaryFileMap[uri]
  }

  const mainBufferDef = json.buffers[0]
  let mainBuffer = uriToBuffer(mainBufferDef.uri)
  delete mainBufferDef.uri

  // Convert all images into main buffer
  // todo reuse bufferviews for same image uri
  const bufferViews = json.bufferViews
  json.images && json.images.forEach((imageDef) => {
    if (imageDef.uri) {
      imageDef.name = imageDef.name || path.basename(imageDef.uri)
      let imageType = path.extname(imageDef.uri).slice(1)
      console.log("Image type", imageType)
      if (imageType === "jpg") imageType = "jpeg"
      if (options.convertPNG) {
        imageDef.name = imageDef.name.replace('.png', '.jpeg')
        imageType = 'jpeg'
      }
      
      const mimeType = `image/${imageType}`
      imageDef.mimeType = imageDef.mimeType || mimeType
      const imageBuffer = uriToBuffer(imageDef.uri)
      
      const offset = mainBuffer.length
      const length = imageBuffer.length   
      const padBytes = 4 - (length % 4)
      const padBuffer = Buffer.alloc(padBytes) 
      mainBuffer = Buffer.concat([mainBuffer, imageBuffer, padBuffer])
      
      const bufferView = {
        buffer: 0,
        byteLength: length,
        byteOffset: offset
      }
      bufferViews.push(bufferView)
      const bufferViewIndex = json.bufferViews.length - 1
      delete imageDef.uri
      imageDef.bufferView = bufferViewIndex
    }
  })

  mainBufferDef.byteLength = mainBuffer.length
  
  return new GLB(json, mainBuffer)
}
