import getCache from './cache.js';
import threeConstants from './three_constants.js';

let colladaLoader;
let colladaModels;
let xmlParser;
let iterator;
let cache;
let baseUrl;
let divMessages;


THREE.Cache.enabled = true;

export default function setupConverter() {
  colladaLoader = new THREE.ColladaLoader();
  divMessages = document.getElementById('messages');
  xmlParser = new DOMParser();
  return {
    parse: parseColladas
  };
}


// start parsing all loaded Colladas
function parseColladas() {
  cache = getCache();
  colladaModels = cache.getColladas();
  iterator = colladaModels.entries();
  parseCollada(0);
}


// parse one single Collada
function parseCollada(i) {
  const element = iterator.next();

  if (element.done) {
    divMessages.innerHTML = 'done converting<br>' + divMessages.innerHTML;
    return;
  }
  const colladaName = element.value[0];

  divMessages.innerHTML = `#${++i}: ${colladaName}<br> ${divMessages.innerHTML}`;

  // Parse the XML of the Collada and find all the images that are used in textures.
  const collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  const results = collada.evaluate('//dae:library_images/dae:image/dae:init_from/text()',
    collada,
    function () {
      return 'http://www.collada.org/2005/11/COLLADASchema';
    },
    XPathResult.ANY_TYPE, null
  );

  // Store all images (more precisely: the names of the images).
  let node;
  const imageNames = [];
  while ((node = results.iterateNext()) !== null) {
    imageNames.push(node.textContent);
  }

  // For each found image we store an IMG element in the THREE.Cache to suppress error messages when
  // Three attempts to load the texture images that are not available.
  // Also we add an uuid to the texture image because we need to store it in the JSON file later on.
  const images = [];
  imageNames.forEach(function (imageName) {
    let img = document.createElement('img');
    img.url = imageName;
    img.uuid = THREE.Math.generateUUID();
    THREE.Cache.add(baseUrl + imageName, img);
    images.push({
      url: imageName,
      name: imageName,
      uuid: img.uuid
    });
  });

  // Parse the Collada into a Threejs model, then we traverse the model to find materials with textures; we
  // add a key 'map' to the material if that material uses a texture
  colladaLoader.parse(collada, function (collada) {
    // console.log(collada);
    let model = collada.scene;
    model.scale.set(1, 1, 1);
    colladaModels.set(colladaName, model);
    // console.log(model);

    setTimeout(() => {
      let json = model.toJSON();
      json.images = images;
      saveAs(colladaName + '.json', JSON.stringify(json));

      // clear the caches
      colladaModels.delete(colladaName);
      THREE.Cache.clear();
      // console.log(colladaModels.size);
      json = null;
      parseCollada(i);

    }, 0);
  });
}


function saveAs(filename, data) {
  // let blob = new Blob([data], { type: 'text/plain' });
  // let objectURL = URL.createObjectURL(blob);
  // let link = document.createElement('a');

  // link.href = objectURL;
  // link.download = filename;
  // link.target = '_blank';
  // link.click();

  // from: https://code.sololearn.com/Wde1it1cKxXk/#html
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";

  var json = JSON.stringify(data),
    blob = new Blob([data], { type: "text/plain;charset=utf-8" }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}