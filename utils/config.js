require('dotenv').config();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.DB_URI;
const DB_NAME = process.env.NODE_ENV === 'test'
	? 'test'
	: 'dev';

module.exports = {DB_NAME, MONGODB_URI, PORT};
