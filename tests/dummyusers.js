const bcrypt = require('bcrypt');

const createPasswordHash = (password) => {
	return bcrypt.hashSync(password, 10);
};

const albPassword = createPasswordHash("password234");
const barackPassword = createPasswordHash("obamapwd");
const michellePassword = createPasswordHash("pwdmichelle");

const twoUsers = [
	{
		"name": "Albert Terc",
		"username": "albert123",
		"password": albPassword
	},
	{
		"name": "Barack Obama",
		"username": "bobama12",
		"password": barackPassword
	}
]

const newUser = {
	"name": "Michelle Obama",
	"username": "mobama234",
	"password": michellePassword
}

module.exports = {twoUsers, newUser};