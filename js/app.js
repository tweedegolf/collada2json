import createScene3D from './scene3d';
import createLoader from './loader';
import getCache from './cache';
import saveAs from './util/save_as';

let sceneCollada;
let sceneJson;
let cache;

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  sceneCollada.resize(width / 2, height);
  sceneJson.resize(width / 2, height);
}

window.onload = () => {
  const divMessage = document.getElementById('message');
  const linkDownload = document.getElementById('download-link');

  sceneCollada = createScene3D();
  document.getElementById('canvas_collada').appendChild(sceneCollada.domElement);

  sceneJson = createScene3D();
  document.getElementById('canvas_json').appendChild(sceneJson.domElement);

  createLoader();

  document.addEventListener('converting', (e) => {
    // const { detail: { type } } = e;
    const { detail: { model, json, type } } = e;
    switch (type) {
      case 'start':
        linkDownload.style.display = 'none';
        divMessage.innerHTML = `converting ${model}`;
        break;
      case 'ready':
        divMessage.innerHTML = 'done';
        // add the models
        cache = getCache();
        sceneJson.add(cache.getJsonModel(model));
        sceneCollada.add(cache.getColladaModel(model));
        // create and show the download link
        linkDownload.style.display = 'inline-block';
        linkDownload.onclick = (e1) => {
          saveAs(`${model}.json`, JSON.stringify(json));
          e1.preventDefault();
        };
        cache.clear();
        break;
      default:
        divMessage.innerHTML = 'unrecognized custom event';
    }
  });

  resize();
  window.onresize = resize;
};

