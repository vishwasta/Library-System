module.exports = function(app) {
    var controller = require('../controllers/index.server.controller');
    app.route('/').get(controller.render);
    app.get('/register', controller.register);
    app.post('/registered', controller.registered);
    app.post('/search', controller.search);
    app.post('/login', controller.login);
    app.get('/loggedin', controller.loggedin);
    app.get('/searched', controller.searched);
    app.post('/loggedin/borrow', controller.borrow);
    app.get('/loggedin/borrowed', controller.borrowed);
    app.post('/loggedin/return', controller.return);
    app.get('/loggedin/returned', controller.returned);
    // app.post('/filter',index.filter);
    //app.get('/filtered',index.filtered);
    app.get('/logout', controller.logout);
};