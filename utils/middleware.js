const jwt = require("jsonwebtoken");
const User = require('../models/user');
const extractToken = (req, res, next) => {
	const authorization = req.get('authorization');
	if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
		next();
		return;
	}

	req.token = authorization.substring(7);
	next();
};

const extractUser = async (req, res, next) => {
	const getTokenId = (request) => {
		const token = request.token;
		if (!token) {
			next();
			return;
		}
		const validToken = jwt.verify(token, process.env.SECRET);
		return validToken.id;
	};
	const validTokenId = getTokenId(req);
	if (!validTokenId) {
		next();
		return;
	}
	const user = await User.findById(validTokenId);
	if (!user) {
		next();
		return;
	}

	req.user = user
	next();
}

module.exports = {extractToken, extractUser};