const fs = require('fs');
// const { writeFile: writeFileAsync } = require('node:fs/promises');
// const path = require('path');
const { dailyPuzzle } = require('../constants/filepaths.js');
const { isEmptyObject } = require('../lib/utils');
const { getDateString, getDateAtMidnight } = require('../lib/date-utils');
const { readFile, writeFile } = require('../lib/file-manager');
const { readLatestPuzzleFromDbByDateString } = require('../lib/sqlite-connection');

const dbPath = process.env.DB_PATH || '/home/devuser/databases/toodles-dev.db';
const tableName = process.env.DAILY_PUZZLE_TABLE_NAME || 'daily_puzzles';

// TODO: cache the file using node-cache
/*
async function writeFile(filepath, content) {
	console.log(`writing to ${filepath}`);
	await writeFileAsync(filepath, content);
}
*/

async function generatePuzzleFile() {
	try {

		const today = new Date();
		const dateStringToday = getDateString(getDateAtMidnight(today));
		const puzzle = await readLatestPuzzleFromDbByDateString(dbPath, tableName, dateStringToday);

		if (isEmptyObject(puzzle)) {
			throw new Error('Failed to retrieve puzzle data');
		}

		/*
		if (!fs.existsSync(dirPath)) {
			const dirPath = path.dirname(dailyPuzzle);
			fs.mkdirSync(dirPath, { recursive: true });
		}
		*/
	
		console.log(`Read puzzle from database: ${JSON.stringify(puzzle, null, 2)}`);
		await writeFile(dailyPuzzle, JSON.stringify(puzzle), { createDirIfNeeded: true });
				
		console.log(`Generated puzzle file ${dailyPuzzle}.`);
	} catch (e) {
		console.error(e.message);
		throw(e);
	}
}

generatePuzzleFile();
