var exports = function(io) {

    var express = require('express');
    var passport = require('passport');
    var Account = require('../models/accountSchema');
    var Game = require('../models/gameSchema');
    var router = express.Router();
    var util = require('../util'); 

    router.get("/", function(req, res) {
        if(!req.user) {
            res.redirect('/login/?message=denied');
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

    router.get("/:id", function(req,res) {
        if(!req.user) {
            res.redirect("/login/?message=denied");
            return;
        }
        var game_id = req.params.id + "/";
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
                    var data = {
                        user : req.user,
                        title : util.create_link_text(game.game_id),
                        scores : scores,
                        events : arranged_events
                    };
                    res.render("game", data);
                });
            });
        });
    });

    router.get("/:id/join", function(req,res) {
        if(!req.user) {
            res.redirect("/login/?message=denied");
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
                    if(scores[i].user._id.equals(req.user._id)) {
                        user_in_room = true;
                        res.redirect("/game/"+game.game_id);
                        break;
                    }
                }
                if(!user_in_room) {
                    Game.Score.create(
                        {user : req.user, game : game, score : 0}, 
                        function(err,score) {
                            if(err) console.log(err);
                            io.sockets.emit("player join", {game:game,score:score});
                            res.redirect("/game/"+game.game_id);
                        }
                    );
                }                
            });
        });
    });

    router.get("/:id/leave", function(req,res) {
        if(!req.user) {
            res.redirect("/login/?message=denied");
            return;
        }
        var game_id = req.params.id + "/";
        Game
        .findOne({game_id : game_id})
        .exec(function(err,game) {
            //fill this in!!
        });
    });

    return router;

}

module.exports = exports;