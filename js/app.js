import fs from 'fs';
import path from 'path';
import getCache from './cache.js';
import setupConverter from './converter';

const cache = getCache();
const converter = setupConverter();

let dirCont = fs.readdirSync('./models');
let files = dirCont.filter(elm => {
    return elm.match(/.*\.(dae)/ig);
});

files.forEach(file => {
    const p = path.join(__dirname, '../', 'models', file);
    console.log(p);
    cache.addCollada(file, fs.readFileSync(p, 'utf8'));
});

converter.parse();
