var exports = function(io) {

    var express = require('express');
    var passport = require('passport');
    var Account = require('../models/account');
    var Game = require('../models/game');
    var router = express.Router();

    router.get('/', function (req, res) {
        res.render('index', { user : req.user });
    });

    router.get('/register', function(req, res) {
        res.render('register', { });
    });

    router.post('/register', function(req, res) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
              return res.render("register", {info: "Sorry. That username already exists. Try again."});
            }

            passport.authenticate('local')(req, res, function () {
                res.redirect('/');
            });
        });
    });

    router.get('/login', function(req, res) {
        res.render('login', { user : req.user });
    });

    router.post('/login', passport.authenticate('local'), function(req, res) {
        res.redirect('/');
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/ping', function(req, res){
        res.status(200).send("pong!");
    });

    /* GET Userlist page. */
    router.get('/userlist', function(req, res) {
        Account.find({},function(err,accounts) {
            res.render('userlist', {
                "userlist" : accounts
            });
        });
    });

    router.get('/gamelist', function(req, res) {

        var temp = new Game({
            game_id : "abcdefg",
            user : req.user,
            score : 0
        });

        temp.save(function (err) {
            if (err) return handleError(err);
            console.log("saved!");
        });

        io.sockets.emit('new game',temp.game_id);

        Game.find({},function(err,games) {

            res.render('gamelist', {
                "gamelist" : games
            });
        });
    });

    return router;
}

module.exports = exports;
