function isEmptyObject(obj) {
	return Object.getOwnPropertyNames(obj).length === 0 && obj.constructor === Object;
}

module.exports = {
	isEmptyObject,
};
