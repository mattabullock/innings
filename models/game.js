var mongoose = require('mongoose');
var Account = require('../models/account');
var Schema = mongoose.Schema;

var Game = new Schema({
    game_id: String,
    user: { type: Schema.Types.ObjectId, ref: 'Account' },
    score: Number
});

module.exports = mongoose.model('Game', Game);