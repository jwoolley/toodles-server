const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const {
	readPuzzlesFromDb, 
	readSinglePuzzleFromDbByDateString,
	readLatestPuzzleFromDbByDateString,
} = require('../lib/sqlite-connection');
const { isEmptyObject } = require('../lib/utils');

const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || '/home/devuser/databases/toodles-dev.db';
const DAILY_PUZZLE_TABLE_NAME = 'daily_puzzles';

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

function getDateString(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;	
}

// accepts a Date object, returns a new Date object with time = 00:00:00:000z
function getDateAtMidnight(date) {
	return new Date(Date.parse(getDateString(date)));
}

// hacky!! load from static file instead & fix
const puzzlePageHtml = `<head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro&display=swap" rel="stylesheet">

	<style>
	body {
		background-color: #040300;
	}

  .contentContainer {
		padding: 1rem;
		color: #ffffe5;
		text-align: left;
		font-size: 1.25rem;
		text-size-adjust: 200%;
		font-family: 'Source Sans Pro';
		position:  absolute;
	}

	@media screen and (max-width: 800px) {
  	   div.contentContainer {
    	   padding: 2rem;
	}
  }
	</style>
</head>
<body><pre class="contentContainer">__PUZZLE_DATA__</pre></body>`;

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
		]
	}
];

function devGetPuzzle() {
	const index = Math.floor(Math.random() * puzzles.length);
	return puzzles[index];
}

function getFormattedHtml(puzzleData) {
  	return puzzlePageHtml.replace('__PUZZLE_DATA__', JSON.stringify(puzzleData, null, '&emsp;'));
}

async function fetchPuzzles(dbPath, tableName) {
	console.log(`Reading puzzles from table ${tableName} in database ${dbPath}`);
	return readPuzzlesFromDb(dbPath, tableName);
}

// TODO: read from script-generated file instead of hitting the db directly
async function getDailyPuzzle(dbPath, tableName) {
	const today = new Date(); // NOTE THAT THIS WILL CAUSE PROBLEMS IF local date differs from db record (e.g. timezone difference)	
	const dateStringToday = getDateString(getDateAtMidnight(today));
	let puzzle = await readSinglePuzzleFromDbByDateString(dbPath, tableName, dateStringToday);
	if (isEmptyObject(puzzle)) {
		puzzle = await readLatestPuzzleFromDbByDateString(dbPath, tableName, dateStringToday);
	}
	return puzzle;
}

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
	 		: getFormattedHtml(puzzleData);

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
	 		: getFormattedHtml(puzzleData);

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
