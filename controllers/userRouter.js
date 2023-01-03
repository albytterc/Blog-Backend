const UserRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

UserRouter.route('/')
	.get(async (req, res) => {
		const users = await User.find({}).populate('posts', {title: 1, url: 1})
		res.json(users);
	})
	.post(async (req, res) => {
		const {name, username, password} = req.body;

		const usernameExists = await User.exists({username: username});
		if (usernameExists) {
			return res.status(400).json({error: "Username already taken"})
		}

		if (!password || password.length < 3) {
			return res.status(400).json({error: "Invalid password"})
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const user = new User({name, username, password: passwordHash});

		try {
			const savedUser = await user.save();
			res.status(201).json(savedUser);
		} catch (e) {
			if (e.name === 'ValidationError') {
				res.status(400).json({error: 'Invalid name, username, or password'})
			}
		}
	});


module.exports = UserRouter;
