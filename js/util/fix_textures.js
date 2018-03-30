/* eslint no-param-reassign: off */

import THREE from 'three';

const fixTransparentTexture = (material) => {
  material.needsUpdate = true;
  // If the opacity is set other than 1, a transparent texture is used. We need to set some
  // additional properties to make the texture look good.
  if (material.opacity !== 1) {
    // material.depthWrite = false;
    // material.depthTest = false;
    material.alphaTest = 0.5;
    // material.transparent = true;
    material.opacity = 1;
    material.side = THREE.DoubleSide;
  }
};

const fixTextures = (model) => {
  model.traverse((child) => {
    // check if the child has a material and if that material has a texture
    if (child.material) {
      // child.material.emissive = new THREE.Color(0, 0, 0);
      // child.material.map.wrapS = THREE.ClampToEdgeWrapping;
      // child.material.map.wrapT = THREE.ClampToEdgeWrapping;
      // child.material.map.minFilter = THREE.LinearFilter;
      if (child.material.map) {
        child.material.needsUpdate = true;
        fixTransparentTexture(child.material);
      } else if (child.material.type === 'MultiMaterial') {
        child.material.materials.forEach(fixTransparentTexture);
      }
    }
  });
};

export default fixTextures;
