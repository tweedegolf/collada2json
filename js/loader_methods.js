'use strict';

import setupColladaMethods from './collada_methods.js';

export default function createLoader(){

  let fileSelect = document.getElementById('fileSelect');
  let fileElem = document.getElementById('fileElem');
  let fileReader = new FileReader();
  let textures = new Map();
  let colladas = new Map();
  let pattern = /\.dae$/i;
  let fileList, numFiles, currentIndex, fileType, fileName;
  let colladaMethods = setupColladaMethods();
  let divMessage = document.getElementById('loading');


  fileElem.onchange = function(e){
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
      textures.set(fileName, fileReader.result);
    }else if(fileType === 'xml'){
      colladas.set(fileName, fileReader.result);
    }

    loadFile();
  }, false);


  function loadFile(){
    let file;

    if(++currentIndex >= numFiles){
      //console.log(colladas.size, textures.size);
      colladaMethods.parse(colladas, textures);
      //console.log(colladas.size, textures.size);
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

    fileName = fileName.substring(0, fileName.indexOf('.'));
  }
}