var exports = function(io) {

    var express = require('express');
    var request = require('request');
    var cheerio = require('cheerio');
    var Game = require('../models/gameSchema');
    var router = express.Router();
    var util = require('../util');

    router.get('/update_games', function(req, res) {
        io.sockets.emit("new day");
        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth()+1;
        var year = today.getFullYear();
        if(day<10) day='0'+day
        if(month<10) month='0'+month 
        var url = "http://gd2.mlb.com/components/game/mlb/year_"+year+"/month_"+month+"/day_"+day+"/";
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                var items = $('ul').find('li');
                items.each(function(i,item) {
                    var href = item.children[0].attribs.href;
                    if(href.substring(0,3) == "gid") {
                        Game.findOne({"game_id": href}, "game_id", function(err, game) {
                            if (err) console.log("ERROR"); //fix this
                            if (!game) {
                                Game.create({game_id: href, users: []}, function(err) {
                                    if(err) console.log("ERROR"); //fix this
                                    var data = {
                                        "link" : href,
                                        "title" : util.create_link_text(href)
                                    };
                                    io.sockets.emit('new game',data);
                                });
                            }
                        });
                    }
                });
            }
        });
        res.status(200).send();
    });

    return router;
}

module.exports = exports;
