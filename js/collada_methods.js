import * as THREE from 'three';
import './lib/collada_loader';
// import './lib/object_loader_r75';
import getCache from './cache';
import fixTextures from './util/fix_textures';

const colladaLoader = new THREE.ColladaLoader();
const xmlParser = new DOMParser();
const baseUrl = 'undefined'; // intentionally undefined

THREE.Cache.enabled = true;

const parseCollada = () => {
  const cache = getCache();
  const textures = cache.getTextures();
  const colladaModels = cache.getColladas();
  const iterator = colladaModels.entries();
  const element = iterator.next();
  const colladaName = element.value[0];

  document.dispatchEvent(new CustomEvent('converting', {
    detail: {
      type: 'start',
      model: colladaName,
    },
  }));

  const collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  const results = collada.evaluate(
    '//dae:library_images/dae:image/dae:init_from/text()',
    collada,
    () => 'http://www.collada.org/2005/11/COLLADASchema',
    XPathResult.ANY_TYPE, null
  );

  // console.log(results.iterateNext());

  // For each found image we store an IMG element in the THREE.Cache to suppress error messages when
  // Three attempts to load the texture images that are not available. Also we add an uuid to the
  // texture image because we need to store it in the JSON file later on.
  let loop = true;
  const images = [];
  while (loop) {
    const node = results.iterateNext();
    if (node !== null) {
      const imageName = node.textContent;
      const img = document.createElement('img');
      img.uuid = THREE.Math.generateUUID();
      // set the data URI for src because it has already been loaded.
      img.src = textures.get(imageName);
      THREE.Cache.add(imageName, img); // for json model
      THREE.Cache.add(baseUrl + imageName, img); // for collada model
      images.push({
        url: imageName,
        name: imageName,
        uuid: img.uuid,
      });
    } else {
      loop = false;
    }
  }
  // console.log(cache.getTextures());

  const parsed = colladaLoader.parse(element.value[1]);
  // console.log(parsed);

  setTimeout(() => {
    const colladaModel = parsed.scene ? parsed.scene : parsed;
    colladaModel.scale.set(1, 1, 1);
    colladaModels.set(colladaName, colladaModel);
    fixTextures(colladaModel);

    // const loader = new THREE.ObjectLoaderR75();
    const loader = new THREE.ObjectLoader();
    const json = colladaModel.toJSON();
    const jsonModel = loader.parse(json);
    // overwrite the images array with the actual image urls instead of the data URI's
    json.images = images;
    jsonModel.scale.set(1, 1, 1);
    cache.addJsonModel(colladaName, jsonModel);

    document.dispatchEvent(new CustomEvent('converting', {
      detail: {
        type: 'ready',
        json,
        model: colladaName,
      },
    }));
    THREE.Cache.clear();
  }, 0);
};

export default function setupColladaMethods() {
  return {
    parse: parseCollada,
  };
}
