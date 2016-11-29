var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var postSchema =  Schema( {
 	content : String,
 	date  : {type : Date,  default: Date.now }
 	
});  
module.exports = mongoose.model("post", postSchema);