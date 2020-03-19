const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const glob = require('glob');
var browserify = require('browserify-middleware');
const { execSync } = require('child_process')
const postData = require('./post.js')
var files = [];

const app = express()
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'))
app.use('/js', browserify(__dirname + '/js'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post(`/save/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  sync(changes);
  res.sendStatus(200);
});

app.post(`/update/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  console.log(changes)
  updateManifest(changes);
  res.sendStatus(200);
});

app.post(`/delent/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  delent(changes);
  res.sendStatus(200);
});

app.get(`/cleangit/${process.env.PASS}`, (req, res) => {
  console.log('removed .git/index')
  execSync('cd .git && rm index')
  res.sendStatus(200);
});

app.post(`/setdapp/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  console.log(changes)
  setdapp(changes);
  res.sendStatus(200);
});

app.post(`/navmesh/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  console.log(changes)
  setnavmesh(changes);
  res.sendStatus(200);
});

app.post(`/glb/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  console.log(changes)
  insertGlb(changes);
  res.sendStatus(200);
});

app.post(`/img/${process.env.PASS}`, (req, res) => {
  const changes = req.body;
  insertImgs(changes);
  res.sendStatus(200);
});

app.post(`/clone/${process.env.PASS}`, (req, res) => {
  const changes = req.body.text
  console.log(changes)
  insertClone(changes);
  res.sendStatus(200);
});

app.get('/postdata', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(postData, null, 3))
});

function prettyPrintChanges (changes) {
  let output = '';
  Object.keys(changes).forEach(id => {
    output += `#${id}:\n`;
    Object.keys(changes[id]).forEach(component => {
      if (typeof changes[id][component] === 'object') {
        output += `  ${component}:\n`;
        Object.keys(changes[id][component]).forEach(property => {
          output += `    ${property}: ${changes[id][component][property]}\n`;
        });
      } else {
        output += `  ${component}: ${JSON.stringify(changes[id][component], null, 1)}\n`;
      }
    });
    output += '\n';
  });
  return output;
}

var postFile = ['./post.js']
function isDup (hash) {
  for (var asset in postData.assets){
    return hash == postData.assets[asset].hash 
  }
}

function insertClone(ip){
  files.forEach(fileL => {
    var contents = fs.readFileSync(fileL, 'utf-8')
    const modelEntries = ip
    const appendMatchIndex = contents.indexOf('</a-scene');
    contents = contents.substr(0,appendMatchIndex) + modelEntries + contents.substr(appendMatchIndex, contents.length-1)
    fs.writeFileSync(fileL, contents);
    execSync(`git add ${fileL}`)
    });
  execSync(`git commit -m "Updated images" && refresh`)
  return;
}

function delent(ip){
  console.log(ip)
  const rin = new RegExp(ip.in,'mg')
  const rout = new RegExp(ip.out,'mg')
  files.forEach(fileL => {
    var contents = fs.readFileSync(fileL, 'utf-8')
    if(ip.in){
      var inmatch = rin.exec(contents)
      contents = contents.substr(0,inmatch.index) + contents.substr(inmatch.index + ip.in.length, contents.length-1)
      }
    const outmatch = rout.exec(contents)
    contents = contents.substr(0,outmatch.index) + contents.substr(outmatch.index + ip.out.length, contents.length-1)
    fs.writeFileSync(fileL, contents);
    execSync(`git add ${fileL}`)
    });
  execSync(`git commit -m "Removed an Entity" && refresh`)
  return;
}

function insertImgs(ip){
  console.log(ip)
  postFile.forEach(file => {
    for (var i = 0; i < ip.refs.length; i++){
       if(!isDup(ip.refs[i].hash)){ postData.customJson.assets.push({hash:ip.refs[i].hash,pin:ip.pin,size:ip.refs[i].size,name:`${ip.info[i][0]}`})
      }
      if (!ip.is360)postData.body = `![${ip.info[i][0]}](https://ipfs.io/ipfs/${ip.refs[i].hash})\n`+ postData.body
    }
    if (ip.is360){postData.customJson.Hash360=ip.refs[0].hash}
    const changed = `let postData = ` + JSON.stringify(postData,null,3) + `
module.exports = postData;`
    fs.writeFileSync(file, changed);
    execSync(`git add ${file}`)
  });
  files.forEach(fileL => {
    
    var file = fs.readFileSync(fileL, 'utf-8')
    const appendMatchIndex = file.indexOf('</a-scene');
    var assetMatchIndex = file.indexOf('</a-assets');
    if(appendMatchIndex == -1){return;}
    var assetEntries = ''
    var modelEntries = ''
    for (var i = 0; i < ip.refs.length; i++) {
      var assetEntry = `<img id="${ip.info[i][0].split('.')[0]}" src="https://ipfs.io/ipfs/${ip.refs[i].hash}?.${ip.info[i][1]}" crossorigin="anonymous" >\n`
      assetEntries += assetEntry
      if (ip.new) {
      var modelEntry
      if (ip.is360){
        modelEntry = `<a-entity geometry="primitive:sphere" id="${ip.info[i][0].split('.')[0]}1" material="src:#${ip.info[i][0].split('.')[0]}"></a-entity>\n`
      } else {
        modelEntry = `<a-entity geometry="primitive:box" id="${ip.info[i][0].split('.')[0]}1" material="src:#${ip.info[i][0].split('.')[0]}"></a-entity>\n`
    }
      modelEntries += modelEntry
      }
    }
    if(assetMatchIndex == -1){
      assetEntries = '\n<a-assets>\n' + assetEntries + '\n</a-assets>'
      assetMatchIndex = file.split('<a-scene')[1].indexOf('>') + 1;
    }
      var contents
      if (ip.new){
      contents= file.substr(0,appendMatchIndex) + modelEntries + file.substr(appendMatchIndex, file.length-1)
      } else {contents = file}
      contents = contents.substr(0,assetMatchIndex) + assetEntries + contents.substr(assetMatchIndex, contents.length-1)
    fs.writeFileSync(fileL, contents);
    execSync(`git add ${fileL}`)
    });
  execSync(`git commit -m "Updated images" && refresh`)
  return;
}

function insertGlb (changes){
  console.log(changes.customJson)
  const op = changes.customJson.assets[0].asset.path
  var found = false
  var rh = 0
  var staticE = ''
  if (changes.customJson.assets[0].static)staticE = ' class="static"' 
  console.log(staticE)
  postFile.forEach(file => {
    for (var i = 1; i < postData.customJson.assets.length;i++){
      if(postData.customJson.assets[i].name == changes.customJson.assets[0].asset.path){found = i;rh=postData.customJson.assets[i].hash}
    }
    console.log(found)
    if(!found){
    postData.customJson.assets.push({hash:changes.customJson.assets[0].asset.hash,name:changes.customJson.assets[0].asset.path,size:changes.customJson.assets[0].asset.size,pin:changes.customJson.assets[0].pin})
      const changed = `let postData = ` + JSON.stringify(postData,null,3) + `
module.exports = postData;`
      console.log(3, changed)
      fs.writeFileSync(file, changed);
      execSync(`git add ${file}`)
    } else {
    postData.customJson.assets[found] = {hash:changes.customJson.assets[0].asset.hash,name:changes.customJson.assets[0].asset.path,size:changes.customJson.assets[0].asset.size,pin:changes.customJson.assets[0].pin}
      const changed = `let postData = ` + JSON.stringify(postData,null,3) + `
module.exports = postData;`
      console.log(3, changed)
      fs.writeFileSync(file, changed);
      execSync(`git add ${file}`)
    }
  });
  var num = postData.customJson.assets.length
  if (found){num=found+1}
  var assetEntry = `<a-asset-item id="autogen${num}" src="https://ipfs.io/ipfs/${changes.customJson.assets[0].asset.hash}?.glb" crossorigin="anonymous" ></a-asset-item>\n`
  var modelEntry = `<a-entity id="ag${num}" gltf-model="#autogen${num}"${staticE}></a-entity>\n`
  if (op == 'navmesh.glb')modelEntry = `<a-entity id="ag${num}" gltf-model="#autogen${num}" nav-mesh visible="false"></a-entity>\n`
  files.forEach(fileL => {
    var file = fs.readFileSync(fileL, 'utf-8')
    if(found){
      const ra = `<a-asset-item id="autogen${num}" src="https://ipfs.io/ipfs/${rh}?.glb" crossorigin="anonymous" ></a-asset-item>\n`
      console.log(ra)
      const rout = new RegExp(ra,'mg')
      console.log(rout)
    const outmatch = file.indexOf(ra)
    file = file.substr(0,outmatch) + file.substr(outmatch + ra.length, file.length-1)}
    const appendMatchIndex = file.indexOf('</a-scene');
    if(appendMatchIndex == -1){return;}
      var assetMatchIndex = file.indexOf('</a-assets');
      if(assetMatchIndex == -1){
        assetEntry= '\n<a-assets>\n\t' + assetEntry + '\r</a-assets>\n'
        assetMatchIndex = file.split('<a-scene')[1].indexOf('>') + 1;
  }
    var contents = file.substr(0,appendMatchIndex) + modelEntry + file.substr(appendMatchIndex, file.length-1)
    contents = contents.substr(0,assetMatchIndex) + assetEntry + contents.substr(assetMatchIndex, contents.length-1)
  
    fs.writeFileSync(fileL, contents);
    execSync(`git add ${fileL}`)
  });
  console.log('Manifest Updated', postFile);
  execSync(`git commit -m "Updated assets" && refresh`)
  return;
}


function insertChanges (string, changes) {
      var dataObj = JSON.parse(string)
      var newChanges
      newChanges = JSON.parse(JSON.stringify(changes, null, 2))
      console.log('IC',dataObj,newChanges)
      for (var prop in newChanges){
        var isObj = false
        try {if (typeof newChanges[prop] !== 'object'){isObj = true}  
          if(newChanges[prop].isArray()){isObj = true}} catch (e){}
        if (!isObj) {
          dataObj[prop] = newChanges[prop]
        } else {
          console.log(666,prop,newChanges[prop])
          dataObj[prop] = JSON.parse(insertChanges(JSON.stringify(dataObj[prop],null,2), JSON.parse(JSON.stringify(newChanges[prop],null,2))))
          
        }
      }
      return JSON.stringify(dataObj, null, 2)
    }


function setdapp (changes) {
  console.log(changes, 2)
  postFile.forEach(file => {
    const manifest = fs.readFileSync(file, 'utf-8')
    var stringSci = manifest
      stringSci = stringSci.substr(
        stringSci.indexOf('{') -1,
          stringSci.indexOf(`module.exports`) - stringSci.indexOf('{'))
    postData.customJson.vrHash = changes.vrHash[0].hash
    postData.customJson.assets[0] = {hash:changes.vrHash[0].hash,size:changes.vrHash[0].size,pin:true}
    const changed = `let postData = ` + JSON.stringify(postData,null,2) + `
module.exports = postData;`
    console.log(3, changed)
    fs.writeFileSync(file, changed);
    execSync(`git add ${file}`)
  });
  console.log(4)
  execSync(`git commit -m "Updated vrhash" && refresh`)
  console.log('Manifest Updated', postFile);
}

function setnavmesh (changes) {
  var found = 0
  console.log(changes, 2)
  postFile.forEach(file => {
    const manifest = fs.readFileSync(file, 'utf-8')
    var stringSci = manifest
      stringSci = stringSci.substr(
        stringSci.indexOf('{') -1,
          stringSci.indexOf(`module.exports`) - stringSci.indexOf('{'))
    for(var i=1;i< postData.customJson.assets.length;i++){
    if (postData.customJson.assets[i].name == 'navmesh.gltf'){found=i}
    }
    if(found){
      var oldnav = postData.customJson.assets[found].hash
      var ip = `<a-asset-item id="navmesh" src="https://ipfs.io/ipfs/${oldnav}?.gltf" crossorigin="anonymous" ></a-asset-item>\n`
    postData.customJson.assets[found] = {hash:changes[0].hash,name:changes[0].path,size:changes[0].size,pin:true}
    const rout = new RegExp(ip,'m')
    files.forEach(fileL => {
    var contents = fs.readFileSync(fileL, 'utf-8')
    const outmatch = rout.exec(contents)
    contents = contents.substr(0,outmatch.index) + contents.substr(outmatch.index + ip.out.length, contents.length-1)
    fs.writeFileSync(fileL, contents);
    execSync(`git add ${fileL}`)
    });
    }else{
    postData.customJson.assets.push({hash:changes[0].hash,name:changes[0].name,size:changes[0].size,pin:true})
    }
    
    const changed = `let postData = ` + JSON.stringify(postData,null,2) + `
module.exports = postData;`
    console.log(3, changed)
    fs.writeFileSync(file, changed);
    execSync(`git add ${file}`)
});
  var assetEntry = `<a-asset-item id="navmesh" src="https://ipfs.io/ipfs/${changes.customJson.assets[0].asset.hash}?.gltf" crossorigin="anonymous" ></a-asset-item>\n`
  var modelEntry = `<a-entity id="navmeshent" navmesh gltf-model="#navmesh"></a-entity>\n`
  files.forEach(fileL => {
    var file = fs.readFileSync(fileL, 'utf-8')
    const foundent = file.indexOf(modelEntry);
    if(foundent !== -1){modelEntry = ''}
    const appendMatchIndex = file.indexOf('</a-scene');
    if(appendMatchIndex == -1){return;}
      var assetMatchIndex = file.indexOf('</a-assets');
      if(assetMatchIndex == -1){
        assetEntry= '\n<a-assets>\n\t' + assetEntry + '\r</a-assets>'
        assetMatchIndex = file.split('<a-scene')[1].indexOf('>') + 1;
  }
    var contents = file.substr(0,appendMatchIndex) + modelEntry + file.substr(appendMatchIndex, file.length-1)
    contents = contents.substr(0,assetMatchIndex) + assetEntry + contents.substr(assetMatchIndex, contents.length-1)
    fs.writeFileSync(fileL, contents);
    execSync(`git add ${fileL}`)
  });
  console.log('Manifest Updated for NavMesh', postFile);
  execSync(`git commit -m "Updated NavMesh" && refresh`)
}


function updateManifest (changes) {
  console.log(changes, 2)
  postFile.forEach(file => {
    postData.account = changes.account
    postData.title = changes.title
    postData.body = changes.body
    postData.customJson = changes.customJson
    postData.permlink = changes.permlink
    const changed = `let postData = ` + JSON.stringify(postData,null,2) + `
module.exports = postData;`
    console.log(3, changed)
    fs.writeFileSync(file, changed);
    execSync(`git add ${file}`)
  });
  console.log(4)
  execSync(`git commit -m "Updated manifest" && refresh`)
  console.log('Manifest Updated', postFile);
}

function sync (changes) {
  files.forEach(file => {
    const contents = updateFile(file, fs.readFileSync(file, 'utf-8'), changes);
    fs.writeFileSync(file, contents);
    console.log(file)
    execSync(`git add ${file}`)
  });
  execSync(`git commit -m "Watcher saved some files" && refresh`)
  console.log('Sync complete.', files);
}

/**
 * Given changes, scan for IDs, and write to HTML file.
 */
function updateFile (file, content, changes) {
  console.log(changes)
  // Matches any character including line breaks.
  const filler = '([^]*?)';
  const whitespace = '[\\s\\n]';
  const propertyDelimit = '["\\s;\]';

  Object.keys(changes).forEach(id => {
    // Scan for ID in file.
    const regex = new RegExp(`<a-entity${filler}(${whitespace})id="${id}"${filler}>`);
    const match = regex.exec(content);
    if (!match) { 
      const split = '></a-entity>'
      const lastMatch = `<a-entity id="${id}"></a-entity>\n`
      const idWhitespaceMatch = ' ';

      const entityMatchIndex = content.indexOf('</a-scene');
      if(entityMatchIndex == -1){return;}
      const originalEntityString = lastMatch;
      let entityString = lastMatch;
      Object.keys(changes[id]).forEach(attribute => {
        // Check if component is defined already.
        const attributeRegex = new RegExp(`(${whitespace})${attribute}="(.*?)(;?)"`);
        const attributeMatch = attributeRegex.exec(entityString);
        const value = changes[id][attribute];

        if (typeof value === 'string') {
        // Single-property attribute match (e.g., position, rotation, scale).
          if (attributeMatch) {
            const whitespaceMatch = attributeMatch[1];
          // Modify.
            entityString = entityString.replace(
            new RegExp(`${whitespaceMatch}${attribute}=".*?"`),
            `${whitespaceMatch}${attribute}="${value}"`
            );
          } else {
            // Add.
            entityString = entityString.replace(
            new RegExp(`${idWhitespaceMatch}id="${id}"`),
            `${idWhitespaceMatch}id="${id}" ${attribute}="${value}"`
            );
          }
        } else {
          // Multi-property attribute match (e.g., material).
          Object.keys(value).forEach(property => {
            const attributeMatch = attributeRegex.exec(entityString);
            const propertyValue = value[property];

            if (attributeMatch) {
              // Modify attribute.
              let attributeString = attributeMatch[0];
              const whitespaceMatch = attributeMatch[1];
              const propertyRegex = new RegExp(`(${propertyDelimit})${property}:(.*?)([";])`);
              var propertyMatch = propertyRegex.exec(attributeMatch);

              if (propertyMatch) {
                // Modify property.
                const propertyDelimitMatch = propertyMatch[1];
                attributeString = attributeString.replace(
                new RegExp(`${propertyDelimitMatch}${property}:(.*?)([";])`),
                `${propertyDelimitMatch}${property}: ${propertyValue}${propertyMatch[3]}`
                );
              } else {
                // Add property to existing.
                attributeString = attributeString.replace(
                new RegExp(`${whitespaceMatch}${attribute}="(.*?)(;?)"`),
                `${whitespaceMatch}${attribute}="${attributeMatch[2]}${attributeMatch[3]}; ${property}: ${propertyValue}"`
                );
              }

              // Update entity string with updated component.
              entityString = entityString.replace(attributeMatch[0], attributeString);
            } else {
              // Add component entirely.
              entityString = entityString.replace(
              new RegExp(`${idWhitespaceMatch}id="${id}"`),
              `${idWhitespaceMatch}id="${id}" ${attribute}="${property}: ${propertyValue}"`
              );
            }
          });
        }
  
        console.log(`Built ${attribute} of #${id} in ${file}.`);
      });
      // Splice in updated entity string into file content.
      content = content.substring(0, entityMatchIndex) +
              entityString +
              content.substring(entityMatchIndex,content.length);

    } else {

    // Post-process regex to get only last occurence.
    const split = match[0].split('<a-entity');
    const lastMatch = '<a-entity' + split[split.length - 1]
    const idWhitespaceMatch = match[2];

    const entityMatchIndex = content.indexOf(lastMatch);
    const originalEntityString = lastMatch;
    let entityString = lastMatch;

    // Scan for components within entity.
    Object.keys(changes[id]).forEach(attribute => {
      // Check if component is defined already.
      const attributeRegex = new RegExp(`(${whitespace})${attribute}="(.*?)(;?)"`);
      const attributeMatch = attributeRegex.exec(entityString);
      const value = changes[id][attribute];

      if (typeof value === 'string') {
        // Single-property attribute match (e.g., position, rotation, scale).
        if (attributeMatch) {
          const whitespaceMatch = attributeMatch[1];
          // Modify.
          entityString = entityString.replace(
            new RegExp(`${whitespaceMatch}${attribute}=".*?"`),
            `${whitespaceMatch}${attribute}="${value}"`
          );
        } else {
          // Add.
          entityString = entityString.replace(
            new RegExp(`${idWhitespaceMatch}id="${id}"`),
            `${idWhitespaceMatch}id="${id}" ${attribute}="${value}"`
          );
        }
      } else {
        // Multi-property attribute match (e.g., material).
        Object.keys(value).forEach(property => {
          const attributeMatch = attributeRegex.exec(entityString);
          const propertyValue = value[property];

          if (attributeMatch) {
            // Modify attribute.
            let attributeString = attributeMatch[0];
            const whitespaceMatch = attributeMatch[1];
            const propertyRegex = new RegExp(`(${propertyDelimit})${property}:(.*?)([";])`);
            var propertyMatch = propertyRegex.exec(attributeMatch);

            if (propertyMatch) {
              // Modify property.
              const propertyDelimitMatch = propertyMatch[1];
              attributeString = attributeString.replace(
                new RegExp(`${propertyDelimitMatch}${property}:(.*?)([";])`),
                `${propertyDelimitMatch}${property}: ${propertyValue}${propertyMatch[3]}`
              );
            } else {
              // Add property to existing.
              attributeString = attributeString.replace(
                new RegExp(`${whitespaceMatch}${attribute}="(.*?)(;?)"`),
                `${whitespaceMatch}${attribute}="${attributeMatch[2]}${attributeMatch[3]}; ${property}: ${propertyValue}"`
              );
            }

            // Update entity string with updated component.
            entityString = entityString.replace(attributeMatch[0], attributeString);
          } else {
            // Add component entirely.
            entityString = entityString.replace(
              new RegExp(`${idWhitespaceMatch}id="${id}"`),
              `${idWhitespaceMatch}id="${id}" ${attribute}="${property}: ${propertyValue}"`
            );
          }
        });
      }
      console.log(entityString)
      console.log(`Updated ${attribute} of #${id} in ${file}.`);
      });
    // Splice in updated entity string into file content.
    content = content.substring(0, entityMatchIndex) +
              entityString +
              content.substring(entityMatchIndex + originalEntityString.length,
                                content.length);
    }
  });
  return content;
}
module.exports.updateFile = updateFile;

/**
 * What files to edit, can be passed in as glob string.
 */
function getWorkingFiles () {
  let globString = '';
  process.argv.forEach(function (val, index, array) {
    if (index < 2 || val.substr(0,4) == 'node') { return; }
    if (!globString) {
      globString += `{${val}`;
    } else {
      globString += `${val}`;
    }

    if (index !== process.argv.length - 1) { globString += ','; }
  });
  if (globString) { globString += '}'; }

  console.log(globString);
  return glob.sync(globString || '**/*.html');
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 51234;
  app.listen(PORT, () => {
    console.log(`Watching for messages from Inspector on glitch:${PORT}.`);
  });

  var prefiles = getWorkingFiles();
  for (var i = 0;i < prefiles.length;i++){
    if (prefiles[i].indexOf('post.html') > 0){
      
      files.push(prefiles[i])
    }
  }
  console.log('Found HTML files:', files);
}
