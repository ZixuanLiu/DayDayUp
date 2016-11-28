var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
// define the schema for our user model
var userSchema = Schema ({

    local            : {
        email        : String,
        password     : String,
        userName     : String,
        schedules    : [{ type : Schema.Types.ObjectId, ref: "schedule" }]

    }

});


userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
