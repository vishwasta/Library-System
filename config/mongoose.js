var config = require('./config'),
    mongoose = require('mongoose').set('debug', true);;
module.exports = function() {
    var db = mongoose.connect(config.dburl, { useNewUrlParser: true });
    require('../app/models/book.server.model');
    require('../app/models/users.server.model');
    return db;
};