var get_team_name = function(code) {
    var teams = {
        "atlmlb" : "Atlanta Braves", "slnmlb" : "St. Louis Cardinals",
        "balmlb" : "Baltimore Orioles", "tbamlb" : "Tampa Bay Rays",
        "chamlb" : "Chicago White Sox", "clemlb" : "Cleveland Indians",
        "cinmlb" : "Cincinatti Reds", "colmlb" : "Colorado Rockies",
        "detmlb" : "Detroit Tigers", "bosmlb" : "Boston Red Sox",
        "houmlb" : "Houston Astros", "kcamlb" : "Kansas City Royals",
        "lanmlb" : "Los Angeles Dodgers", "nynmlb" : "New York Mets",
        "miamlb" : "Miami Marlins", "sdnmlb" : "San Diego Padres",
        "milmlb" : "Milwaukee Brewers", "arimlb" : "Arizona Diamondbacks",
        "nyamlb" : "New York Yankees", "minmlb" : "Minnesota Twins",
        "oakmlb" : "Oakland Athletics", "sfnmlb" : "San Francisco Giants",
        "phimlb" : "Philadelphia Phillies", "chnmlb" : "Chicago Cubs",
        "texmlb" : "Texas Rangers", "anamlb" : "Los Angeles Angels of Anaheim",
        "tormlb" : "Toronto Blue Jays", "seamlb" : "Seattle Mariners",
        "wasmlb" : "Washington Nationals", "pitmlb" : "Pittsburgh Pirates"
    };

    return teams[code];
}

var create_link_text = function(data) {
    var re = /[a-z]{3}mlb/g;
    var found = data.match(re);
    var away = get_team_name(found[0]);
    var home = get_team_name(found[1]);
    return away + " @ " + home;
}

var exports = { 
    "create_link_text" : create_link_text,
    "get_team_name" : get_team_name
};

module.exports = exports;