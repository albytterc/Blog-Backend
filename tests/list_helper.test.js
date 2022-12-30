const listHelper = require('../utils/list_helper');
const {oneBlog, blogs, blogsChanMostLikes} = require('./dummyblogs');


test('dummy returns one', () => {
	const emptyBlogs = [];

	const result = listHelper.dummy(emptyBlogs);
	expect(result).toBe(1);
});

describe('totalLikes', () => {
	test('with only one blog, total equals blog\'s likes', () => {
		const result = listHelper.totalLikes(oneBlog);
		expect(result).toBe(5);
	});

	test('sums all blog likes', () => {
		const result = listHelper.totalLikes(blogs);
		expect(result).toBe(36);
	});
});

describe('favoriteBlog', () => {
	test('one blog, only one is favorite', () => {
		const result = listHelper.favoriteBlog(oneBlog);
		expect(result).toEqual(
			{
				_id: 'heres my id',
				title: 'Go to harmful',
				author: 'Dijkstra',
				url: 'https://bloglink.com',
				likes: 5,
				__v: 0
			}
		);
	});

	test('blog with 12 likes is favorite', () => {
		const result = listHelper.favoriteBlog(blogs);
		expect(result).toEqual(
			{
				_id: "5a422b3a1b54a676234d17f9",
				title: "Canonical string reduction",
				author: "Edsger W. Dijkstra",
				url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
				likes: 12,
				__v: 0
			}
		);
	});
});

describe('mostBlogs', () => {
	test('multiple blogs', () => {
		const result = listHelper.mostBlogs(blogs);
		expect(result).toEqual(
			{
				author: "Edsger W. Dijkstra",
				blogs: 3
			}
		)
	})

	test('one blog only', () => {
		const result = listHelper.mostBlogs(oneBlog);
		expect(result).toEqual({
			author: "Dijkstra",
			blogs: 1
		})
	})

})

describe('mostLikes', () => {
	test('multiple blogs', () => {
		const result = listHelper.mostLikes(blogs);
		expect(result).toEqual({
			author: 'Edsger W. Dijkstra',
			likes: 19
		})
	})

	test('multiple blogs -- chan most likes', () => {
		const result = listHelper.mostLikes(blogsChanMostLikes);
		expect(result).toEqual({
			author: 'Michael Chan',
			likes: 30
		})
	})

	test('one blog', () => {
		const result = listHelper.mostLikes(oneBlog);
		expect(result).toEqual({
			author: 'Dijkstra',
			likes: 5
		})
	})
})