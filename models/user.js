const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	name: { type: String, required: true, maxLength: 100 },
	username: { type: String, required: true, minLength: 3, maxLength: 100 },
	password: { type: String, required: true },
	posts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Blog'
	}]
});

userSchema.set('toJSON', {
	transform: (doc, obj) => {
		obj.id = obj._id.toString();
		delete obj._id;
		delete obj.password;
		delete obj.__v;
	}
});

module.exports = mongoose.model('User', userSchema);
