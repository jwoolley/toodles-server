const fs = require('fs');
const {
	readFile: readFileAsync,
	writeFile: writeFileAsync
} = require('node:fs/promises');
const path = require('path');

const _staticFileMap = {};

async function readFile(filepath) {
	return await readFileAsync(filepath, 'utf-8');
}

async function loadStaticFile(filepath) {
	if (!_staticFileMap[filepath]) {
		console.log(`Reading file ${filepath}`); 
		_staticFileMap[filepath] = await readFile(filepath);
	}
	return _staticFileMap[filepath]; 
}

async function writeFile(filepath, content, options={}) {
	if (options.createDirIfNeeded) {
		const dirPath = path.dirname(filepath);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
	}
	console.log(`writing to ${filepath}`);
	await writeFileAsync(filepath, content);
}

module.exports = {
	loadStaticFile,
	readFile,
	writeFile,
};
