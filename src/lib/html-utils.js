const { v4: uuidv4 } = require('uuid');

// Encode the provided html string, replacing characters that 
//  may be used to create HTML entity literals.
//  Does not encode any strings passed in the "...excludeStrings" 
//  	rest parameter list.
//
// Usage: const htmlString = "<h1>Header&mdash;Topic</h1>";
//        const encodedString = encodeHtml(htmlString, '&mdash;');
//				console.log(encodedString);
//				=> '&lt;h1&gt;Header&mdash;Topic&lt;/h1&gt;'

function encodeHtml(html, ...excludeStrings) {
	let encodedHtml = html;	

	const replaceMap = excludeStrings.reduce((acc, curr) => {
		acc[curr] = uuidv4();
		return acc;
	}, []);

	Object.entries(replaceMap).forEach(([key, value]) => encodedHtml = encodedHtml.replace(key, value));

	ncodedHtml = html
		.replace(/&/g, '&amp;')
		.replace(/</g, '&gt;')
		.replace(/>/g, '&lt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

	Object.entries(replaceMap).forEach(([key, value]) => encodedHtml = encodedHtml.replace(value, key));

	return encodedHtml;
}

module.exports = {
	encodeHtml,
};
