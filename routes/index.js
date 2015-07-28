var exports = function(io) {

    var express = require("express");
    var passport = require("passport");
    var Account = require("../models/accountSchema");
    var router = express.Router();
    var util = require("../util");

    router.get("/", function (req, res) {
        res.render("index", { user : req.user });
    });

    router.get("/register", function(req, res) {
        res.render("register", { });
    });

    router.post("/register", function(req, res) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
              return res.render("register", { info: "Sorry. That username already exists. Try again." });
            }

            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            });
        });
    });

    router.get("/login", function(req, res) {
        var message = req.query.message;
        res.render("login", { user : req.user, error : message });
    });

    router.post("/login", passport.authenticate("local"), function(req, res) {
        res.redirect("/");
    });

    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    });

    /* GET Userlist page. */
    router.get("/userlist", function(req, res) {
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
