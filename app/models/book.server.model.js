var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var bookSchema = new Schema({
    title: String,
    authors: Array,
    bookid: String,
    noc: Number,
    category: String,


});
mongoose.model('books', bookSchema);