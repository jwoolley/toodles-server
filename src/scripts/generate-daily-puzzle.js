const fs = require('node:fs/promises');

const DB_PATH = process.env.DB_PATH;
console.log(`(didn't actually) generate puzzle file. Connecting to database ${DB_PATH}`);
