# innings
Baseball game where you predict what happens each inning.

TODO:
* When you enter a game room, enter a socket.io room, only emit changes to socket.io room
* Update events (using socket.io) when /update_games is called
* Fill in events on bottom linescore
* Complete /submit_guess
    * ADD CSRF TOKENS
* Add guess form on page
* Make everything live update (cron and socket.io)
* Test test test