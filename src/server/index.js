const express = require('express');

const PORT = process.env.PORT || 4000;
const app = express();

// hacky!! load from static file instead & fix
const puzzlePageHtml = `<head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Alice&display=swap" rel="stylesheet">

	<style>
	body {
		background-color: #040300;
	}

  div.contentContainer {
		padding: 1rem;
		color: #00ffff;
		text-align: center;
		font-size: 2rem;
		text-size-adjust: 500%;
		font-family: Alice;
		position:  absolute;
		left:  50%;
		margin-right: -50%;
		transform: translate(-50%, 0%);
	}

	@media screen and (max-width: 800px) {
  	   div.contentContainer {
    	   padding: 2rem;
	}
  }
	</style>
</head>
<body><div class="contentContainer">__PUZZLE_DATA__</div></body>`;

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
	const index = Math.Random() * puzzles.length;
	return puzzles[index];
}

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/daily-puzzle', async (req, res) => {
  try {
  	const html = puzzlePageHtml.replace('__PUZZLE_DATA__', devGetPuzzle());
  	res
  		.header('Content-Type', 'text/html')
  		.send(html);
  } catch (e) {
  	const errMessage = `Error making request to puzzle API: ${e.message}`;
  	console.error(errMessage);
  	res.send(errMessage);
  }
});

app.use(express.static('./src/server/static/images'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
