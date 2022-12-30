const Blog = require('../models/blog')
const User = require('../models/user')
const getAllBlogs = async () => {
	const posts = await Blog.find({});
	return posts.map(post => post.toJSON());
};

const getAllUsers = async () => {
	const users = await User.find({});
	return users.map(user => user.toJSON());
};

module.exports = {getAllUsers, getAllBlogs}