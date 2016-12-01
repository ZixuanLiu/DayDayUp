var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
// define the schema for our user model
var scheuleSchema = Schema({

    creator : {type : Schema.Types.ObjectId, ref: "User" },
    title : String,
    descrip : String, 
    posts : [{type: Schema.Types.ObjectId, ref :"post" }],
    lastUpdate : {type: Date},
    score: {type: Number},
    createdBy: {type: Date}

});


module.exports = mongoose.model("schedule", scheuleSchema);


//module.exports = scheuleSchema;
//module.exports = postSchema;

