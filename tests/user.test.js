const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const dummyusers = require('./dummyusers');
const test_helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
	await User.deleteMany({});
	console.log('cleared the db');

	const userObjs = dummyusers.twoUsers.map(user => new User(user));
	const promises = userObjs.map(userObj => userObj.save());
	await Promise.all(promises);
	console.log('added users to db');
});

describe('getUsers', () => {
	test('users returned as json', async () => {
		await api
			.get('/api/users')
			.expect(200)
			.expect('Content-Type', /application\/json/);
	});

	test('two users found after two users added', async () => {
		const {body} = await api.get('/api/users');
		expect(body).toHaveLength(2);
	});

	test('users contain property id, not _id', async () => {
		const {body} = await api.get('/api/users');
		body.map(blog => expect(blog.id).toBeDefined());
	});
});

describe('postNewUser', () => {
	test('num of users increases by one', async () => {
		const {body} = await api
			.post('/api/users')
			.send(dummyusers.newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		expect(body.name).toContain('Michelle Obama');

		const getResponse = await api.get('/api/users');
		expect(getResponse.body).toHaveLength(dummyusers.twoUsers.length + 1);
	});

	test('bad request short name, username or password', async () => {

		const shortUsername = {
			name: 'albert j terc',
			username: 'al',
			password: '23jfgj9fs'
		};

		const shortPassword = {
			name: 'mama june',
			username: 'mynamemommajune',
			password: '23'
		};


		const shortUsernameError = await api
			.post('/api/users')
			.send(shortUsername)
			.expect(400);

		expect(shortUsernameError.body).toEqual({error: 'Invalid name, username, or password'});

		const shortPasswordError = await api
			.post('/api/users')
			.send(shortPassword)
			.expect(400);

		expect(shortPasswordError.body).toEqual({error: 'Invalid password'});
	});

	test('existing user not added', async () => {
		const existinUsername = {
			name: 'albert terc',
			username: 'albert123',
			password: 'newpasswordhere'
		};

		await api
			.post('/api/users')
			.send(existinUsername)
			.expect(400)
			.expect((res) => expect(res.body).toEqual({error: "Username already taken"}));
	});
});

describe('deleteUser', () => {
	test('num of users decreases by 1', async () => {
		const users = await test_helper.getAllPosts();
		const blogToDelete = users[0];

		await api.delete('/api/users/' + blogToDelete.id).expect(204);

		const {body} = await api.get('/api/users');
		body.map(blog => expect(blog.id).not.toBe(blogToDelete.id));
		expect(body).toHaveLength(dummyusers.twoUsers.length - 1);
	});

	test('deleting nonexistent blog throws 404 error', async () => {
		const blogToDelete = "63ab8bdd27af6dc32e4fc78c";
		await api.delete('/api/users/' + blogToDelete).expect(404);
	});
});

describe('updateUser', () => {
	test('404 error for nonexistent blog', async () => {
		const blogToUpdate = "63ab8bdd27af6dc32e4fc78c";
		const newUserInfo = {
			title: 'Go to harmful',
			author: 'Dijkstra',
			url: 'https://bloglink.com',
			likes: 50
		};
		await api.put('/api/users/' + blogToUpdate).send(newUserInfo).expect(404);
	});

	test('information is updated properly, sends 200 status code', async () => {
		const users = await test_helper.getAllPosts();
		const blogToUpdate = users[0];
		const newUserInfo = {
			title: 'Go to harmful',
			author: 'Dijkstra',
			url: 'https://bloglink.com',
			likes: 50
		};

		const {body} = await api.put('/api/users/' + blogToUpdate.id).send(newUserInfo).expect(200);
		expect(body.likes).toBe(50);
		expect(body.title).toBe("Go to harmful");
		expect(body.author).toBe("Dijkstra");
		expect(body.url).toBe("https://bloglink.com");
	});
});

describe('loginUser', () => {
	test('existing user 1 is logged in and receives token', async () => {
		const existingUser = {
			username: 'bobama12',
			password: 'obamapwd'
		};

		const {body} = await api
			.post('/api/login')
			.send(existingUser)
			.expect(200);

		expect(body.token).toBeDefined();
		expect(body.username).toBeDefined();
		expect(body.name).toBeDefined();
		console.log("token:", body.token);
	});

	test('existing user 2 is logged in and receives token', async () => {
		const existingUser = {
			username: 'albert123',
			password: 'password234'
		};

		const {body} = await api
			.post('/api/login')
			.send(existingUser)
			.expect(200);

		expect(body.token).toBeDefined();
		expect(body.username).toBeDefined();
		expect(body.name).toBeDefined();
		console.log("token:", body.token);
	});

	test('nonexistent user is not logged in', async () => {
		const nonexistentUser = {
			username: 'iamalbert',
			password: 'passwordddddd'
		};

		const {body} = await api
			.post('/api/login')
			.send(nonexistentUser)
			.expect(401);

		expect(body.token).toBeUndefined();
		expect(body.username).toBeUndefined();
		expect(body.name).toBeUndefined();
		expect(body.error).toBeDefined();
		console.log("error:", body.error);
	});
});

afterAll(() => {
	mongoose.connection.close();
});
