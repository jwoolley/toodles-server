const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { readPuzzlesFromDb } = require('../lib/sqlite-connection');

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

function fetchPuzzles(dbPath, tableName) {
	console.log(`Reading puzzles from table ${tableName} in database ${dbPath}`);
	return readPuzzlesFromDb(dbPath, tableName);
}

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/daily-puzzle', async (req, res) => {
  try {
  	// const html = puzzlePageHtml.replace('__PUZZLE_DATA__', JSON.stringify(devGetPuzzle(), null, '&emsp;'));

		const results = await fetchPuzzles(DB_PATH, DAILY_PUZZLE_TABLE_NAME);
  	const html = puzzlePageHtml.replace('__PUZZLE_DATA__', JSON.stringify(results.puzzles, null, '&emsp;'));
  	res
  		.header('Content-Type', 'text/html')
  		.send(html);
  } catch (e) {
  	const errMessage = `Error making request to puzzle API: ${e.message}`;
  	console.error(errMessage);
  	res.send(errMessage);
  }
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.static('./src/server/static/images'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
