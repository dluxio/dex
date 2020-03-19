var dragDrop = require('drag-drop')
const GLBPacker = require('./browser-glb-packer')
const writer = require('./browser-glb-writer')
const pngToJpeg = require('png-to-jpeg')

dragDrop("body", function(files) {
	const convertPNG = document.querySelector('#convertpng').checked
  const makeUnlit = document.querySelector('#makeunlit').checked
  const pinIpfs = document.querySelector('#pinthis').checked
  const navMesh = document.querySelector('#nav').checked
  const navStatic = document.querySelector('#static').checked
  var glbFile = 0
	const gltfFile = files.find((f) => f.name.indexOf('.gltf') != -1)
	if (!gltfFile) {
    glbFile = files.find((f) => f.name.indexOf('.glb') != -1)
    if (!glbFile){
		  alert("No .gltf or glb file in this folder")
		  return
    }
	}

	const buffers = []
	let pending = 0
	files.forEach((f) => {
		pending++
		const reader = new FileReader()
		reader.onload = () => {
			let imageBuffer = Buffer.from(reader.result)
      let name = f.fullPath.substring(1)
			if (convertPNG && f.name.indexOf('.png') != -1) {
				imageBuffer = pngToJpeg({quality: 90})(imageBuffer)
				.then((jpeg) => {
					buffers[name] = jpeg
					pending--
					if (pending == 0) finish(name)
				})
			} else {
				buffers[name] = imageBuffer
				pending--
        if (glbFile){ saveToIpfs(imageBuffer, [pinIpfs,0,name,navStatic])}
				else if (pending == 0){ finish(name)}
			}
			
		}
		reader.readAsArrayBuffer(f)
	})
  
	function saveByteArray(fileName, byte) {
	    var blob = new Blob([byte]);
      //call ipfs here
	    var link = document.createElement('a');
      document.body.appendChild(link)
      link.style = 'display: none'
	    link.href = window.URL.createObjectURL(blob);
	    link.download = fileName;
	    link.click();
	};
  
  var saveByteArray2 = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (name, data) {
        var blob = new Blob(data, {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

	function finish(name) {
    console.log("Finish", buffers)
    try {
      const jsonBufferKey = Object.keys(buffers).find((k) => k.indexOf('.gltf') != -1)
      const jsonBuffer = buffers[jsonBufferKey]
      const pathCharacters = jsonBufferKey.lastIndexOf('/') + 1
      console.log("Path characters", pathCharacters)
      if (pathCharacters != 0) {
        Object.keys(buffers).forEach(k => {
          const newKey = k.substring(pathCharacters)
          console.log(newKey)
          buffers[newKey] = buffers[k]

        })
      }
      const dec = new TextDecoder("utf-8");
      const json = JSON.parse(dec.decode(jsonBuffer))
      const glb = GLBPacker(json, buffers, { convertPNG, makeUnlit })
      const output = writer(glb)
      console.log("Output", output)
      saveToIpfs(output,[pinIpfs,navMesh,name,navStatic])
      //saveByteArray('out.glb', output)
    } catch (e) {
      alert("Something went wrong: " + e) 
    }
	}
	
})


