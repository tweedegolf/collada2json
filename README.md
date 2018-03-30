# Collada to JSON converter

The tool runs in a browser and converts Colladas to Threejs' own JSON format. The resulting JSON file can be downloaded to your hard disk. Textures, multimaterial and transparency are supported.

There are 2 versions, this is the preview version. It shows a preview of the model both as Collada and as JSON. There is a headless version as well that just converts the Collada, see this [repository](https://github.com/tweedegolf/collada2json_headless)).

The preview version is suitable if you want to convert only one or a few models and check the models side by side for possible conversion errors. If you want to convert a large number of Colladas you’d better use the headless version.

You can checkout the code and run the tool on your local computer, or you can use live versions directly from these urls:

 - [preview version](https://tweedegolf.github.io/collada2json)
 - [headless version](https://tweedegolf.github.io/collada2json_headless)


To run the code on your local computer:

 - npm install
 - npm run watch

The last command starts a local webserver at http://localhost:8000.

All npm scripts:

 - npm start &rarr; starts a local webserver at http://localhost:8000
 - npm run watch &rarr; compiles esnext code to javascript as soon as you have changed code
 - npm run build &rarr; compiles and minifies the code and creates a source map
