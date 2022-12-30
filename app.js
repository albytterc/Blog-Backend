const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const {MONGODB_URI, DB_NAME} = require('./utils/config');
const BlogRouter = require('./controllers/blogRouter');
const UserRouter = require('./controllers/userRouter');
const LoginRouter = require('./controllers/loginRouter');

mongoose.set('strictQuery', true);
mongoose.connect(MONGODB_URI, {dbName: DB_NAME});

app.use(cors());
app.use(express.json());

app.use('/api/blogs', BlogRouter);
app.use('/api/users', UserRouter);
app.use('/api/login', LoginRouter);


module.exports = app;