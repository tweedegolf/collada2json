'use strict';

import setupColladaMethods from './collada_methods.js';
import getCache from './cache.js';

export default function createLoader(){

  let cache = getCache();
  let fileSelect = document.getElementById('fileSelect');
  let fileElem = document.getElementById('fileElem');
  let fileReader = new FileReader();
  let pattern = /\.dae$/i;
  let fileList, numFiles, currentIndex, fileType, fileName;
  let colladaMethods = setupColladaMethods();
  let divMessage = document.getElementById('message');


  fileElem.onchange = function(e){
    cache.clear();
    fileList = e.target.files;
    numFiles = fileList.length;
    currentIndex = -1;
    loadFile();

    /*
    let files = e.target.files;
    let patternCollada = /\.dae$/;
    let patternTexture = /(\.png|\.jpg)$/;

    Object.keys(files).forEach(function(key){
      let file = files[key];
      if(patternCollada.test(file.name)){
        colladas.set(file.name, file);
      }else if(patternTexture.test(file.name)){
        textures.set(file.name, file);
      }
    });
    */
  };


  fileSelect.addEventListener('click', function (e) {
    if(fileElem) {
      fileElem.click();
    }
    e.preventDefault(); // prevent navigation to '#'
  }, false);


  fileReader.addEventListener('load', function(){
    if(fileType === 'image'){
      cache.addTexture(fileName, fileReader.result);
    }else if(fileType === 'xml'){
      cache.addCollada(fileName, fileReader.result);
    }

    loadFile();
  }, false);


  function loadFile(){
    let file;

    if(++currentIndex >= numFiles){
      colladaMethods.parse();
      return;
    }

    file = fileList[currentIndex];
    fileName = file.name;
    fileType = file.type;
    divMessage.innerHTML = 'loading ' + fileName;

    if(fileType.indexOf('image') !== -1){
      fileType = 'image';
      fileReader.readAsDataURL(file);
    }else if(pattern.test(fileName)){
      fileType = 'xml';
      fileReader.readAsText(file);
    }else{
      loadFile();
    }
  }
}