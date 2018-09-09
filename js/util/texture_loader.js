import * as THREE from 'three';

THREE.Cache.enabled = true;

let baseUrl; // intentionally undefined

const loadTexture = (texture) => {
  const loader = new THREE.TextureLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      texture,
      // onLoad
      (t) => {
        console.log(texture, t);
        resolve(t);
      },
      // onProgress
      undefined,
      // onError
      (err) => {
        reject(err);
      }
    );
  });
};

const loadImage = imageName => new Promise((resolve, reject) => {
  const img = document.createElement('img');
  img.onload = () => {
    THREE.Cache.add(baseUrl + imageName, img);
    img.uuid = THREE.Math.generateUUID();
    resolve(img);
  };
  img.onerror = (err) => {
    reject(err);
  };
  img.src = imageName;
});


export default async (imageName) => {
  const i = await loadImage(imageName);
  return i;
};

