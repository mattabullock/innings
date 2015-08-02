# innings
Baseball game where you predict what happens each inning.

TODO:
* When you enter a game room, enter a socket.io room, only emit changes to socket.io room
* Can't leave game after guess has been submitted
* Make everything live update (cron and socket.io)
* Add support for extra innings
* Find end of game and make inactive
* Scores are all trying to update at the same time, only get one of them. FIX make_event in updates.js.
    * If multiple events happen in one update everything goes haywire.
* Fix double counting of guesses.
* Test test test