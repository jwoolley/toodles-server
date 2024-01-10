
const fs = require('node:fs/promises');

const _staticFileMap = {};

async function readFile(filepath) {
	return fs.readFile(filepath, 'utf-8');
}

async function loadStaticFile(filepath) {
	if (!_staticFileMap[filepath]) {
		console.log(`Reading file ${filepath}`); 
		_staticFileMap[filepath] = await readFile(filepath);
	}
	return _staticFileMap[filepath]; 
}

module.exports = {
	readFile,
	loadStaticFile,
};
