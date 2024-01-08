const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const DB_PATH = process.env.DB_PATH || '/home/devuser/databases/toodles-dev.db';
const DAILY_PUZZLE_TABLE_NAME = 'daily_puzzles';
console.log(`connecting to ${DB_PATH}`);

// expecting dateString in YYYY-MM-DD format
function dateStringToDate(dateString) {
	const dateStringRegexp = /^[[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

	if (!dateStringRegexp.test(dateString) || isNaN(Date.parse(dateString))) {
			throw new Error(`Invalid date format: ${dateString}`);	
	}
	return Date.parse(dateString);
}

function dbRowToPuzzleData(dbRow) {
	try {
		const puzzleData = {};
		puzzleData.puzzleId = dbRow.puzzle_id;
		puzzleData.startingLetters = dbRow.starting_letters;
		puzzleData.scrambledLetters = dbRow.scrambled_letters;
		puzzleData.hint = dbRow.hint;
		puzzleData.difficulty = dbRow.difficulty;
		
		const parsedSolution = JSON.parse(dbRow.solution_json);
		if (!Array.isArray(parsedSolution)) {
			throw new Error(`Expected solution_json to be an array, but it wasn't. solution_json: ${dbRow.solution_json}`);
		}
		puzzleData.solution = parsedSolution;
		
		puzzleData.createdTsSeconds = dbRow.created_ts_seconds;
		puzzleData.puzzleDay = dateStringToDate(dbRow.puzzle_day);

		return puzzleData;	
	} catch (e) {
		throw new Error('Error parsing puzzle data: ' + e.message);
	}
}

async function readPuzzlesFromDb(dbPath, tableName) {
	try {
		const db = await sqlite.open({
			filename: dbPath,
			driver: sqlite3.Database,
		});

		const rows = await db.all(
			`SELECT puzzle_id, starting_letters, scrambled_letters, hint, difficulty, solution_json, created_ts_seconds, puzzle_day FROM ${tableName}`
		);

		// console.log(`Retrieved puzzle data from db: ` + JSON.stringify(rows, null, 2));

		/*
		rows.forEach(row => {
			console.log(JSON.stringify(dbRowToPuzzleData(row), null, 2));
		});
		*/

		const results = {
			puzzles: [],
			errors: [],
		};

		rows.forEach(row => {
			try {
				results.puzzles.push(dbRowToPuzzleData(row));
			} catch (e) {
				results.errors.push({ error: e.message, data: row });
			}
		});	
		return results;
	} catch(e) {
		console.error(e.message);
	}
}

async function testAsyncFetchPuzzles(dbPath, tableName) {
	const results = await readPuzzlesFromDb(dbPath, tableName);
	console.log('Retrieved puzzles from database:\n', JSON.stringify(results, null, 2));
}

// testAsyncFetchPuzzles(DB_PATH, DAILY_PUZZLE_TABLE_NAME);

module.exports = readPuzzlesFromDb;
