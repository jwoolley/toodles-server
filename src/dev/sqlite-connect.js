const sqlite = require('sqlite3').verbose();
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

function callbackRetrievePuzzleDataFromDb(dbPath, tableName) {
	const db = new sqlite.Database(dbPath, err => {
		if (err) {
			console.error(err.message);
		} else {
			console.log(`connected to ${dbPath}`);
			db.each(`SELECT puzzle_id, starting_letters, scrambled_letters, hint, difficulty, solution_json, created_ts_seconds, puzzle_day FROM ${tableName}`,
				(err, row) => {
					try {
						if (err) {
							throw(err);
						}
						console.log(JSON.stringify(dbRowToPuzzleData(row), null, 2));
						/*
						console.log(
							`\npuzzle_id: ${row.puzzle_id},`
						+ `\nstarting_letters: ${row.starting_letters}`
						+ `\nscrambled_letters: ${row.scrambled_letters}`
						+ `\nhint: ${row.hint}`
						+ `\ndifficulty: ${row.difficulty}`
						+ `\nsolution_json: ${row.solution_json}`
						+ `\ncreated_ts_seconds: ${row.created_ts_seconds}`
						+ `\npuzzle_day: ${row.puzzle_day}`
						);
						*/
					} catch (e) {
						console.error(e.message);
					};
			});
		}
	});
}

callbackRetrievePuzzleDataFromDb(DB_PATH, DAILY_PUZZLE_TABLE_NAME);
