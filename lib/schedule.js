var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
// define the schema for our user model
var scheuleSchema = Schema({

    creator : {type : Schema.Types.ObjectId ref: "user" },
    title : String,
    descrip : String, 
    posts : [{type: Schema.Types.ObjectId, ref :"post" }]


});


var postSchema =  Schema( {
 	content : String,
 	date  : {type : Date,  default: Date.now }

});  


module.exports = mongoose.model("schedule", scheuleSchema);

module.exports = mongoose.model("post", postSchema);
//module.exports = scheuleSchema;
//module.exports = postSchema;

