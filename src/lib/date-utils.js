function getDateString(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;	
}

// accepts a Date object, returns a new Date object with time = 00:00:00:000z
function getDateAtMidnight(date) {
	return new Date(Date.parse(getDateString(date)));
}

module.exports = {
	getDateString,
	getDateAtMidnight,
};
