var mongoose = require("mongoose");
var Account = require("../models/accountSchema");
var Schema = mongoose.Schema;

var Game = new Schema({
    game_id : String,
    active : { type : Boolean, default : true },
    date_string : String,
    current_inning : { type : Number, default : 0 }
});

var Score = new Schema({
    user : { type: Schema.Types.ObjectId, ref: "Account" },
    game : { type: Schema.Types.ObjectId, ref: "Game" },
    score : { type : Number, default : 0 }
});

var Event = new Schema({
    event_id : String,
    game : { type: Schema.Types.ObjectId, ref: "Game" },
    inning : String,
    event_type : String
});


var Guess = new Schema({
    user : { type: Schema.Types.ObjectId, ref: "Account" },
    game : { type: Schema.Types.ObjectId, ref: "Game" },
    inning : String,
    guesses : [String]
});

var Base = mongoose.model("Game", Game);

Base.Event = mongoose.model("Event", Event);
Base.Guess = mongoose.model("Guess", Guess);
Base.Score = mongoose.model("Score", Score);

module.exports = Base;