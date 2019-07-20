var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    libid: String,
    username: String,
    password: String,
    name: String,
    year: String,
    dept: String,
    books: Array,



});
mongoose.model('users', userSchema);