# innings
Baseball game where you predict what happens each inning.

TODO:
* When you enter a game room, enter a socket.io room, only emit changes to socket.io room
* Update events (using socket.io) when /update_games is called
* Fill in events on bottom linescore
* Bug: Have to submit twice to update guess... it's always one event behind?
* Make everything live update (cron and socket.io)
* Test test test