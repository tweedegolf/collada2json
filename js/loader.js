'use strict';

import setupConverter from './converter.js';
import getCache from './cache.js';

export default function createLoader(){

  let cache = getCache();
  let fileSelect = document.getElementById('fileSelect');
  let fileElem = document.getElementById('fileElem');
  let fileReader = new FileReader();
  let pattern = /\.dae$/i;
  let fileList, numFiles, currentIndex, fileType, fileName, numModels = 0;
  let converter = setupConverter();
  let divMessages = document.getElementById('messages');


  fileElem.onchange = function(e){
    cache.clear();
    fileList = e.target.files;
    numFiles = fileList.length;
    currentIndex = -1;
    loadFile();
  };


  fileSelect.addEventListener('click', function (e) {
    if(fileElem) {
      fileElem.click();
    }
    e.preventDefault(); // prevent navigation to '#'
  }, false);


  fileReader.addEventListener('load', function(){
    if(fileType === 'xml'){
      cache.addCollada(fileName, fileReader.result);
    }
    loadFile();
  }, false);


  function loadFile(){
    let file;

    if(++currentIndex >= numFiles){
      if(numModels === 0){
        divMessages.innerHTML = 'no models to convert';
        return;
      }else if(numModels === 1){
        divMessages.innerHTML = `start converting ${numModels} model`;
      }else if(numModels > 1){
        divMessages.innerHTML = `start converting ${numModels} models`;
      }
      converter.parse();
      return;
    }

    file = fileList[currentIndex];
    fileName = file.name;
    fileType = file.type;

    divMessages.innerHTML = `loading ${fileName} (${currentIndex+1} of ${numFiles})`;

    if(pattern.test(fileName)){
      numModels++;
      fileType = 'xml';
      fileReader.readAsText(file);
    }else{
      loadFile();
    }
  }
}