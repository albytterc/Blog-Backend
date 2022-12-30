const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const dummydata = require('./dummyblogs');
const test_helper = require('./test_helper');
const jwt = require('jsonwebtoken');

const api = supertest(app);
let tokens = [];

beforeEach(async () => {
	await Blog.deleteMany({});
	console.log('cleared the db');


	const users = await User.find({})
	const signPromises = users.map(user => {
		return jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
	})
	tokens = await Promise.all(signPromises);
	console.log('created new tokens');

	const blogObjs = dummydata.twoBlogs.map(blog => new Blog(blog));
	const promises = blogObjs.map(blogObj => blogObj.save());
	await Promise.all(promises);
	console.log('added blogs to db');
});

describe('getBlogs', () => {
	test('blogs returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/);
	});

	test('two blogs found after two blogs added', async () => {
		const {body} = await api.get('/api/blogs');
		expect(body).toHaveLength(2);
	});

	test('blogs contain property id, not _id', async () => {
		const {body} = await api.get('/api/blogs');
		body.map(blog => expect(blog.id).toBeDefined());
	});
});

describe('postNewBlog', () => {
	test('num of posts increases by one', async () => {
		const {body} = await api
			.post('/api/blogs')
			.send(dummydata.postingNewBlog)
			.set('Authorization', 'Bearer ' + tokens[0])
			.expect(201)
			.expect('Content-Type', /application\/json/);

		expect(body.title).toContain('Go to harmful');

		const getResponse = await api.get('/api/blogs');
		expect(getResponse.body).toHaveLength(dummydata.twoBlogs.length + 1);
	});

	test('likes property default is 0 if missing', async () => {
		const {body} = await api
			.post('/api/blogs')
			.send(dummydata.postingNewBlog)
			.set('Authorization', 'Bearer ' + tokens[0]);

		if (!dummydata.postingNewBlog.likes) {
			console.log('likes missing');
			expect(body.likes).toBe(0);
		} else {
			expect(body.likes).toBe(5);
		}
	});

	test('bad request without title or url', async () => {
		const noTitle = {
			author: 'Dijkstra',
			url: 'https://bloglink.com',
			likes: 5
		};

		const noUrl = {
			title: 'Dijkstra\'s Post',
			author: 'Dijkstra',
			likes: 5
		};

		const noTitleNoUrl = {
			author: 'Dijkstra',
			likes: 5
		};

		await api
			.post('/api/blogs')
			.send(noTitle)
			.set('Authorization', 'Bearer ' + tokens[0])
			.expect(400);

		await api
			.post('/api/blogs')
			.send(noUrl)
			.set('Authorization', 'Bearer ' + tokens[0])
			.expect(400);

		await api
			.post('/api/blogs')
			.send(noTitleNoUrl)
			.set('Authorization', 'Bearer ' + tokens[0])
			.expect(400);
	});

	test('no blog added without token', async () => {
		await api
			.post('/api/blogs')
			.send(dummydata.postingNewBlog)
			.expect(401)
	})

	test('both users can post', async () => {
		await api
			.post('/api/blogs')
			.set('Authorization', 'Bearer ' + tokens[0])
			.send(dummydata.postingNewBlog)
			.expect(201)

		await api
			.post('/api/blogs')
			.set('Authorization', 'Bearer ' + tokens[1])
			.send(dummydata.postingNewBlog)
			.expect(201)
	})
});

// need to add token header for these to work
describe('deleteBlog', () => {
	test('num of blogs decreases by 1', async () => {
		const blogs = await test_helper.getAllPosts();
		const blogToDelete = blogs[0];

		await api.delete('/api/blogs/' + blogToDelete.id).expect(204);

		const {body} = await api.get('/api/blogs');
		body.map(blog => expect(blog.id).not.toBe(blogToDelete.id));
		expect(body).toHaveLength(dummydata.twoBlogs.length - 1);
	});

	test('deleting nonexistent blog throws 404 error', async () => {
		const blogToDelete = "63ab8bdd27af6dc32e4fc78c";
		await api.delete('/api/blogs/' + blogToDelete).expect(404);
	});
});

describe('updateBlog', () => {
	test('404 error for nonexistent blog', async () => {
		const blogToUpdate = "63ab8bdd27af6dc32e4fc78c";
		const newBlogInfo = {
			title: 'Go to harmful',
			author: 'Dijkstra',
			url: 'https://bloglink.com',
			likes: 50
		};
		await api.put('/api/blogs/' + blogToUpdate).send(newBlogInfo).expect(404);
	});

	test('information is updated properly, sends 200 status code', async () => {
		const blogs = await test_helper.getAllPosts();
		const blogToUpdate = blogs[0];
		const newBlogInfo = {
			title: 'Go to harmful',
			author: 'Dijkstra',
			url: 'https://bloglink.com',
			likes: 50
		};

		const {body} = await api.put('/api/blogs/' + blogToUpdate.id).send(newBlogInfo).expect(200);
		expect(body.likes).toBe(50);
		expect(body.title).toBe("Go to harmful");
		expect(body.author).toBe("Dijkstra");
		expect(body.url).toBe("https://bloglink.com");
	});
});

afterAll(() => {
	mongoose.connection.close();
});