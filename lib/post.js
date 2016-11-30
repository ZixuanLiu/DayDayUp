var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var postSchema =  Schema( {
	//postor : {type : Schema.Types.ObjectId, ref: "schedule",  },
 	content : String,
 	date  : {type : Date,  default: Date.now }
 	
});  
module.exports = mongoose.model("post", postSchema);