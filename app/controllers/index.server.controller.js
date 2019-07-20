var bookvdate = new Array();
var statusdata = new Array();
var pagecountdata = new Array();
var session = require('express-session');
var sha512 = require('js-sha512');

var sess;
var searchedBooks;

var error;

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
    res.render('home', { username: sess.username, error: error });
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
    var name;
    var flag1 = false;
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


    await user.find({ 'username': un }, 'libid books', function(err, lid) {
        if (err) {
            console.log("error");
            res.redirect('/loggedin');
            return handleError(err);
        } else {
            var j = 0;
            console.log(lid[0].libid);
            i = lid[0].books.length;
            console.log(i);
            for (j = 0; j < i; j++) {
                if (lid[0].books[j] == bookid) {
                    error = "alreadytaken";
                    flag1 = true;
                    console.log('flag1');

                }
            }
            if (flag1 == true) {
                res.redirect('/loggedin');
            } else if (flag1 == false) {
                if (lid[0].libid == libid2) {
                    console.log('true');
                    if (i < 3) {
                        i = i
                        if (i == 0) {
                            name = 'books.0';
                        } else if (i == 1) {
                            name = "books.1";
                        } else if (i == 2) {
                            name = 'books.2';
                        }
                        user.updateOne({ 'username': un }, {
                            $set: {
                                [name]: bookid
                            }
                        }, function(err, bookupdate) {
                            if (err) {
                                console.log("Not updated")
                            } else {
                                book.updateOne({ 'bookid': bookid }, { $set: { 'noc': numberofcopies - 1 } }, function(err, update) {
                                    if (err) {

                                        console.log("error");
                                    } else {
                                        res.redirect('/loggedin/borrowed');
                                    }

                                });

                            }
                        });


                    } else {
                        console.log("maxbooks");
                        error = "Maxbooks"
                        res.redirect('/loggedin')
                    }
                } else {
                    console.log("id error");
                    error = "iderror"
                    res.redirect('/loggedin');
                }
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


        await user.find({ 'username': un }, 'libid books', function(err, lid) {
            if (err) {
                console.log("error");
                res.redirect('/loggedin');
                return handleError(err);
            } else {

                console.log(lid[0].libid);
                var rbooks = lid[0].books;
                var j = 0;
                var k;
                for (j = 0; j < rbooks.length; j++) {
                    if (rbooks[j] == bookid) {
                        var val = j;
                        break;
                    }

                }
                if (lid[0].libid == libid2) {
                    console.log('true');
                    user.updateOne({ 'username': un }, {
                        $pull: {
                            'books': bookid
                        }
                    }, function(err, pull) {
                        if (err) {
                            console.log(err);
                        } else {
                            book.updateOne({ 'bookid': bookid }, { $set: { 'noc': numberofcopies + 1 } }, function(err, update) {
                                if (err) {

                                    console.log("error");
                                } else {
                                    res.redirect('/loggedin/returned');
                                }

                            });
                        }

                    });

                } else {
                    error = "iderror"
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