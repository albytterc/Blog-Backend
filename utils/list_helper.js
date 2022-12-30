const dummy = (blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
	return blogs.reduce((fav, blog) => {
		if (blog.likes > fav.likes) {
			fav = blog;
		}
		return fav;
	});
};

const mostBlogs = (blogs) => {
	// returns object with the author with the most blogs
	// and the number of blogs he/she has

	const authorsObj = blogs.reduce((authors, blog) => {
		authors[blog.author] = authors[blog.author] + 1 || 1;
		return authors;
	}, {});

	let mostPop = 0;
	let mostPopObj = {};
	for (const [key, val] of Object.entries(authorsObj)) {
		if (val > mostPop) {
			mostPop = val;
			mostPopObj['author'] = key;
			mostPopObj['blogs'] = mostPop;
		}
	}

	return mostPopObj;
};

const mostLikes = (blogs) => {
	const authorsObj = blogs.reduce((authors, blog) => {
		authors[blog.author] = authors[blog.author] + blog.likes || blog.likes;
		return authors
	}, {});

	let max = 0;
	let mostLiked = {}
	for (const [key, val] of Object.entries(authorsObj)) {
		if (val > max) {
			max = val;
			mostLiked['author'] = key;
			mostLiked['likes'] = val;
		}
	}
	return mostLiked;
};


module.exports = {dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes};