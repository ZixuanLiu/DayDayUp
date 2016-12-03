var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var commentSchema =  Schema( {
	//postor : {type : Schema.Types.ObjectId, ref: "schedule",  },
 	content : String,
 	date  : {type : Date,  default: Date.now },
 	creator : {type : Schema.Types.ObjectId, ref: "User" },
 	replyTo : {type : Schema.Types.ObjectId, ref: "User" },

});  
module.exports = mongoose.model("comment", commentSchema);