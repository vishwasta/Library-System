var bookvdate = new Array();
var statusdata = new Array();
var pagecountdata = new Array();
var session = require('express-session');
var sha512 = require('js-sha512');

var sess;
var searchedBooks;

exports.render = async function(req, res, next) {
    sess = req.session;
    if (sess.username) {
        res.redirect('/loggedin');
    } else {
        res.render('index', { message: '' });
    }



}


exports.registered = async function(req, res, next)

{
    var users = require('mongoose').model('users');
    var hpassword = sha512(req.body.password);
    console.log(hpassword);
    console.log(req.body.year);
    console.log(req.body.name);
    await users.create({ 'username': req.body.user, 'password': hpassword, 'name': req.body.name, 'year': req.body.year, 'dept': req.body.dept }, function(err, register) {
        if (err) {
            res.redirect('/register');

        } else {
            //alert('Registered');

            res.redirect('/');
        }
    });
};
exports.register = async function(req, res) {
    res.render('register');
}

exports.login = async function(req, res, next) {
    console.log(req.body);
    var users = require('mongoose').model('users');
    await users.find({ 'username': req.body.user }, 'username password', function(err, login) {

        if (err) {
            console.log("Not authorized");

        } else {
            if (login == null) {
                console.log("Wrong crendentials");


            } else {
                var hash = sha512(req.body.password);
                if (login[0].username == req.body.user && login[0].password == hash) {
                    sess = req.session;
                    sess.username = login[0].username;
                    //console.log(sess);
                    res.redirect('/loggedin');
                } else {
                    res.render('index', { message: '1' });
                }


            }
        }
    });
};

exports.loggedin = async function(req, res) {
    console.log(sess.username);
    res.render('home', { username: sess.username });
}

exports.search = async function(req, res) {
    var Book = require('mongoose').model('books');
    var tName = req.body.bookname || '';
    await Book.find({ 'title': { '$regex': tName, '$options': 'i' } }, 'title authors noc ', function(err, books) {
        if (err) {
            return handleError(err);
        } else {
            searchedBooks = books;
            console.log(searchedBooks.length);
            res.redirect('/searched');
        }
    })
};

exports.searched = async function(req, res) {

    res.render('searched', { searchedBooks: searchedBooks })

}

exports.borrow = async function(req, res, next) {
    var book = require('mongoose').model('books');
    var user = require('mongoose').model('users');
    var bookid = req.body.id;
    var bookname = req.body.book_name;
    var libid2 = req.body.libraryid;
    var un = sess.username;
    var numberofcopies;

    await book.find({ 'bookid': bookid }, 'noc', function(err, noc) {
        if (err) {
            console.log("error");
            res.redirect('/loggedin');
        } else {
            console.log("Inthis");
            if (noc == []) {
                res.redirect('/loggedin');
            } else {

                numberofcopies = noc[0].noc;

                console.log(noc);
            }
        }
    });


    await user.find({ 'username': un }, 'libid', function(err, lid) {
        if (err) {
            console.log("error");
            res.redirect('/loggedin');
            return handleError(err);
        } else {

            console.log(lid[0].libid);

            if (lid[0].libid == libid2) {
                console.log('true')

                book.updateOne({ 'bookid': bookid }, { $set: { 'noc': numberofcopies - 1 } }, function(err, update) {
                    if (err) {

                        console.log("error");
                    } else {
                        res.redirect('/loggedin/borrowed');
                    }

                });
            } else {
                res.redirect('/loggedin');
            }

        }

    });

};





exports.borrowed = async function(req, res) {
    res.render('borrowed');
}


exports.return = async function(req, res) {
    var book = require('mongoose').model('books');
    var user = require('mongoose').model('users');
    var bookid = req.body.returnid;
    var flag = false;
    var libid2 = req.body.returnlibraryid;
    var un = sess.username;
    var numberofcopies;

    await book.find({ 'bookid': bookid }, 'noc', function(err, noc) {
        if (err) {
            console.log("error");
            res.redirect('/loggedin');
        } else {
            console.log("Inthis");
            if (noc == null) {
                res.redirect('/loggedin');
            } else {

                numberofcopies = noc[0].noc;
                flag = true;
                console.log(noc);
            }
        }
    });
    if (flag == true) {


        await user.find({ 'username': un }, 'libid', function(err, lid) {
            if (err) {
                console.log("error");
                res.redirect('/loggedin');
                return handleError(err);
            } else {

                console.log(lid[0].libid);

                if (lid[0].libid == libid2) {
                    console.log('true')

                    book.updateOne({ 'bookid': bookid }, { $set: { 'noc': numberofcopies + 1 } }, function(err, update) {
                        if (err) {

                            console.log("error");
                        } else {
                            res.redirect('/loggedin/returned');
                        }

                    });
                } else {
                    res.redirect('/loggedin');
                }

            }

        });
    }

};

exports.returned = async function(req, res) {

    res.render('returned');
}


exports.logout = async function(req, res) {
    req.session.destroy(function() {
        console.log("user logged out.")
    });
    res.redirect('/');
};