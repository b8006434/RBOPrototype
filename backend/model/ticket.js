//Connect to mongoose and set up schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create new schema with mapping
ticketSchema = new Schema( {
    ticketNumber: Number,
	client: String,
	itemName : String,
	ticketDate : { type : Date, default: Date.now },
	employee: String,
    stateChangeDate : { type : Date, default: Date.now },
    stateChangeUser : String,
    state : String,
    cost : Number,
    maxCost : Number
}),
ticket = mongoose.model('ticket', ticketSchema); //Set up the model

module.exports = ticket; //Export the model to use app wide