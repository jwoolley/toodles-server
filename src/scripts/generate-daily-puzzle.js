const fs = require('fs');
const { dailyPuzzle: dailyPuzzlePath } = require('../constants/filepaths.js');
const { isEmptyObject } = require('../lib/utils');
const { getDateString, getDateAtMidnight } = require('../lib/date-utils');
const { readFile, writeFile } = require('../lib/file-manager');
const { readLatestPuzzleFromDbByDateString } = require('../lib/sqlite-connection');

const dbPath = process.env.DB_PATH || '/home/devuser/databases/toodles-dev.db';
const tableName = process.env.DAILY_PUZZLE_TABLE_NAME || 'daily_puzzles';

async function generatePuzzleFile() {
	try {
		const today = new Date();
		const dateStringToday = getDateString(getDateAtMidnight(today));
		const puzzle = await readLatestPuzzleFromDbByDateString(dbPath, tableName, dateStringToday);

		if (isEmptyObject(puzzle)) {
			throw new Error('Failed to retrieve puzzle data');
		}

		await writeFile(dailyPuzzlePath, JSON.stringify(puzzle), { createDirIfNeeded: true });
				
		console.log(`Generated puzzle file ${dailyPuzzlePath}.`);
	} catch (e) {
		console.error(e.message);
		throw(e);
	}
}

generatePuzzleFile();
