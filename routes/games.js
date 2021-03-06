var exports = function(io) {

    var express = require('express');
    var passport = require('passport');
    var Account = require('../models/accountSchema');
    var Game = require('../models/gameSchema');
    var router = express.Router();
    var util = require('../util'); 

    router.get("/", function(req, res) {
        if(!req.user) {
            res.redirect("/login/?message=denied&redirect="+req.originalUrl);
            return;
        }
        Game.find({},function(err,games) {
            var data = [];
            games.forEach(function(game) {
                data.push({
                    title : util.create_link_text(game.game_id),
                    game : game
                });
            });
            res.render("gamelist", {
                user : req.user,
                gamelist : data
            });
        });
    });

    router.get("/:id/", function(req,res) {
        if(!req.user) {
            res.redirect("/login/?message=denied&redirect="+req.originalUrl);
            return;
        }
        var game_id = req.params.id + "/";
        io.sockets.on("connection", function (socket) {

            socket.on("subscribe", function(data) { 
                socket.join(data.room);
                console.log(io.nsps["/"].adapter);
            });

            socket.on("unsubscribe", function(data) { socket.leave(data.room); });

        });        
        Game
        .findOne({"game_id" : game_id})
        .exec(function(err,game) {
            if(err) console.log(err);
            if(!game) {
                res.sendStatus(404);
                return;
            }
            Game.Score.find({ game : game })
            .populate("user")
            .exec(function(err,scores) {
                var in_room = false;
                for(var i = 0; i < scores.length; i++) {
                    if(scores[i].user.equals(req.user)) {
                        in_room = true;
                        break;
                    }
                }
                Game.Event
                .find({ game : game })
                .exec(function(err,events) {
                    var arranged_events = {};
                    for(var i = 0; i < events.length; i++) {
                        if(typeof arranged_events[events[i].inning] == 'undefined') {
                            arranged_events[events[i].inning] = [];
                        }
                        var short_play = util.shorten_play_name(events[i].event_type);
                        if(short_play) {
                            arranged_events[events[i].inning] = arranged_events[events[i].inning].concat(short_play);
                        }
                    }
                    Game.Guess
                    .find({game : game, user : req.user})
                    .exec(function(err,guesses) {
                        var arranged_guesses = {};
                        for(var i = 0; i < guesses.length; i++) {
                            arranged_guesses[guesses[i].inning] = guesses[i].guesses;
                        }
                        var data = {
                            user : req.user,
                            title : util.create_link_text(game.game_id),
                            game : game,
                            scores : scores,
                            events : arranged_events,
                            csrf : req.csrfToken(),
                            in_room : in_room,
                            guesses : arranged_guesses
                        };
                        res.render("game", data);
                    });
                });
            });
        });
    });

    router.post("/:id/join/", function(req,res) {
        if(!req.user) {
            res.redirect("/login/?message=denied&redirect="+req.originalUrl);
            return;
        }
        var game_id = req.params.id + "/";
        Game
        .findOne({game_id : game_id})
        .exec(function(err,game) {
            if(!game) {
                res.sendStatus(404);
                return;
            }
            Game.Score
            .find({ game : game })
            .populate("user")
            .exec(function(err,scores) {
                var user_in_room = false;
                for(var i = 0; i < scores.length; i++) {
                    if(scores[i].user.equals(req.user)) {
                        user_in_room = true;
                        res.sendStatus(200);
                        break;
                    }
                }
                if(!user_in_room) {
                    Game.Score.create(
                        {user : req.user, game : game, score : 0}, 
                        function(err,score) {
                            if(err) console.log(err);
                            io.sockets.to(game.game_id).emit("player join", {game:game,score:score});
                            res.sendStatus(200);
                        }
                    );
                }                
            });
        });
    });

    router.post("/:id/leave/", function(req,res) {
        if(!req.user) {
            res.redirect("/login/?message=denied&redirect="+req.originalUrl);
            return;
        }
        var game_id = req.params.id + "/";
        Game
        .findOne({game_id : game_id})
        .exec(function(err,game) {
            Game.Score
            .remove({ game : game, user : req.user })
            .exec(function(err) {
                io.sockets.to(game.game_id).emit("player leave", {game:game,user:req.user});
                res.sendStatus(200);
            });
        });
    });

    router.post("/:id/submit_guess", function(req,res) {
        var guesses = Object.keys(req.body);
        var index = guesses.indexOf("_csrf");
        if (index > -1) {
            guesses.splice(index, 1);
        }
        if(req.user && validate_guesses(guesses)) {
            Game
            .findOne({game_id : req.params.id + "/"})
            .exec(function(err,game) {
                if(game !== null) {
                    Game.Score
                    .findOne({
                        game : game,
                        user : req.user
                    })
                    .exec(function(err,score) {
                        if(score !== null) {
                            Game.Guess
                            .findOne({ game : game, user : req.user, inning : game.current_inning })
                            .exec(function(err,guess) {
                                if(guess === null) {
                                    Game.Guess
                                    .create({ 
                                        guesses : guesses, 
                                        inning : game.current_inning,
                                        game : game,
                                        user : req.user
                                    }, function(err,new_guesses) {
                                        if(err) console.log(err);
                                        res.json(new_guesses);
                                    });
                                } else {
                                    guess.guesses = guesses;
                                    guess.save(function(err,new_guesses) {
                                        if(err) console.log(err);
                                        res.json(new_guesses);
                                    });
                                }
                            });
                        } else {
                            res.status(404).send();
                        }
                    });
                } else {
                    res.status(404).send();
                }
            });
        } else {
            res.status(403).send();
        }
    });

    function validate_guesses(guesses) {
        if(guesses.length > 3) {
            return false;
        }
        var plays = [
            "1B","2B","3B","HR",
            "GO","SAC","SF","PO",
            "FO","GIDP","K","BB",
            "WP","L","SB","E"
        ];

        for(var i = 0; i < guesses.length; i++) {
            if(plays.indexOf(guesses[i]) < 0) {
                return false;
            }
        }
        return true;
    }

    return router;

}

module.exports = exports;