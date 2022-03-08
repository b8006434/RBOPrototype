//Connect to mongoose and set up schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create new schema with mapping
userSchema = new Schema( {
	username: String,
	password: String,
	type: String
}),
user = mongoose.model('user', userSchema); //Set up the model

module.exports = user; //Export the model to use app wide