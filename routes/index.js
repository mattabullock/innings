var exports = function(io) {

    var express = require("express");
    var passport = require("passport");
    var Account = require("../models/accountSchema");
    var router = express.Router();
    var util = require("../util");

    router.get("/", function (req, res) {
        res.render("index", { user : req.user });
    });

    router.get("/register/", function(req, res) {
        res.render("register", { csrf : req.csrfToken() });
    });

    router.post("/register/", function(req, res) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
              return res.render("register", { info: "Sorry. That username already exists. Try again." });
            }

            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            });
        });
    });

    router.get("/login/", function(req, res) {
        var message = req.query.message;
        var redirect = req.query.redirect;
        res.render("login", { 
                user : req.user, 
                error : message, 
                csrf : req.csrfToken() ,
                redirect : redirect
            }
        );
    });

    router.post("/login/", passport.authenticate("local"), function(req, res) {
        if(req.body.redirect) res.redirect(req.body.redirect);
        else res.redirect("/");
    });

    router.get("/logout/", function(req, res) {
        req.logout();
        res.redirect("/");
    });

    /* GET Userlist page. */
    router.get("/userlist/", function(req, res) {
        Account.find({},function(err,accounts) {
            res.render("userlist", {
                user : req.user,
                userlist : accounts
            });
        });
    });

    return router;
}

module.exports = exports;
