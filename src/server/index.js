const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { isEmptyObject } = require('../lib/utils');
const { encodeHtml } = require('../lib/html-utils');
const {
	readFile, 
	loadStaticFile,
} = require('../lib/file-manager');
const { readPuzzlesFromDb } = require('../lib/sqlite-connection');
const {
	dailyPuzzle: dailyPuzzlePath,
	puzzlePage: puzzlePagePath,
} = require('../constants/filepaths');

const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || '/home/devuser/databases/toodles-dev.db';
const DAILY_PUZZLE_TABLE_NAME = process.env.DAILY_PUZZLE_TABLE_NAME || 'daily_puzzles';

const staticFilePaths = [ puzzlePagePath ];
const staticFileMap = {};

const corsAllowList = [];
const corsOptions = {
	origin: function(origin, callback) {
		if (corsAllowList.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error('Request prevented by CORS policy'));
		}
	}
};

function isJsonRequest(req) {
	const acceptJsonRegexp = /\bapplication\/json\b/;
	const accept = req.header('accept');
	return acceptJsonRegexp.test(accept);
}

const puzzles = [
	{ 
		id: 24,
		startingLetters: "BBBB",
		scrambledLeters: "asrdrasraeoi",
		hint: "even more animals!",
		difficulty: 1,
		solution: [
			"bass",
			"bear",
			"bird",
			"boar"
		],
		"createdTsSeconds": 1704832896,
		"puzzleDay": 1704758400000
	}
];

function devGetPuzzle() {
	const index = Math.floor(Math.random() * puzzles.length);
	return puzzles[index];
}

async function loadStaticFiles() {
	staticFilePaths.forEach(async path => {
		staticFileMap[path] = await loadStaticFile(path);
		console.log(`Loaded file ${path}`)
	});
}

async function getFormattedHtml(puzzleData) {
		const html = staticFileMap[puzzlePagePath];
  	return html.replace('__PUZZLE_DATA__', encodeHtml(JSON.stringify(puzzleData, null, 4)));
}

async function fetchPuzzles(dbPath, tableName) {
	console.log(`Reading puzzles from table ${tableName} in database ${dbPath}`);
	return readPuzzlesFromDb(dbPath, tableName);
}

async function getDailyPuzzle() {
	try {
		const jsonString = await readFile(dailyPuzzlePath);
		return JSON.parse(jsonString);
	} catch(e) {
		console.error(e);
		return '{}';
	}
}

async function launchServer() {
	await loadStaticFiles();

	const app = express();

	app.get('/', (req, res) => {
		res.send('Hello World!')
	});

	app.get('/api/all-puzzles', async (req, res) => {
		const defaultResponse = '[]';
		try {
			const results = await fetchPuzzles(DB_PATH, DAILY_PUZZLE_TABLE_NAME);
			const puzzleData = results.puzzles;
			const content = isJsonRequest(req)
				? JSON.stringify(puzzleData)
				: await getFormattedHtml(puzzleData);

			const contentType = isJsonRequest(req) ? 'application/json' : 'text/html';

			res
				.header('Content-Type', contentType)
				.send(content);
		} catch (e) {
			const errMessage = `Error rendering page or making request to puzzle API: ${e.message}`;
			console.error(errMessage);
			res.send(defaultResponse);
		}
	});

	app.get('/api/daily-puzzle', async (req, res) => {
		const defaultResponse = '{}';
		try {
			const puzzleData = await getDailyPuzzle(DB_PATH, DAILY_PUZZLE_TABLE_NAME);

			const contentType = isJsonRequest(req) ? 'application/json' : 'text/html';

			const content = isJsonRequest(req)
				? JSON.stringify(puzzleData)
				: await getFormattedHtml(puzzleData);

			res
				.header('Content-Type', contentType)
				.send(content);
		} catch (e) {
			const errMessage = `Error rendering page or making request to puzzle API: ${e.message}`;
			console.error(errMessage);
			res.send(defaultResponse);
		}
	});

	app.use(cors(corsOptions));
	app.use(helmet());
	app.use(express.static('./src/server/static/images'));

	app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

launchServer();
