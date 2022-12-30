const Blog = require("../models/blog");
const User = require('../models/user');
const BlogRouter = require('express').Router();
const {extractUser, extractToken} = require("../utils/middleware");




BlogRouter.route('/')
	.get(async (request, response) => {
		const result = await Blog.find({}).populate('user', {name: 1, username: 1});
		response.json(result);
	})
	.post(extractToken, extractUser, async (request, response) => {
		if (!request.user) {
			return response.status(401).json({error: "User not authorized to create blog post"})
		}

		const body = request.body;
		if (!body.title || !body.url) {
			return response.status(400).json({error: "Missing blog title or URL"});
		}


		const blogCreator = await User.findById(request.user._id);
		const blog = new Blog({...body, user: blogCreator._id});

		const result = await blog.save();
		blogCreator.posts = blogCreator.posts.concat(result._id);
		await blogCreator.save();

		response.status(201).json(result);
	});

BlogRouter.use('/:id', [extractToken, extractUser]);
BlogRouter.route('/:id')
	.delete(async (request, response) => {
		if (!request.user) {
			return response.status(401).json({error: "User not authorized to delete blog post"})
		}


		const blog = await Blog.findById(request.params.id);
		if (!blog) {
			return response.status(400).json({error: 'Blog does not exist'})
		}
		const creatorId = blog.user.toString();
		if (creatorId !== request.user._id.toString()) {
			return response.status(401).json({error: 'User not authorized to delete blog post'});
		}

		const result = await Blog.findByIdAndRemove(request.params.id).exec();
		console.log(result);
		if (result) {
			response.sendStatus(204);
		} else {
			response.status(404).json({error: "Blog not found"});
		}
	})
	.put(async (req, res) => {
		const result = await Blog.findByIdAndUpdate(req.params.id, req.body, {new: true}).exec();
		if (result) {
			res.json(result);
		} else {
			res.status(404).json({error: "Blog not found"});
		}
	});


module.exports = BlogRouter;