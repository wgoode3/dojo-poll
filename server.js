var express = require("express");
var path = require("path");
var app = express();
var port = 8000;

app.use(express.static(path.join(__dirname, "static")));
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

var results = {cheezits: 0, goldfish: 0};

app.get('/', function(req, res){
	res.render('index');
});

app.get('/results', function(req, res){
	res.render('results');
});

var server = app.listen(port, function(){
	console.log(`Listening on port ${port}`);
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	console.log(`Someone connected: ${socket.id}`);

	socket.on("vote", function(vote){
		// console.log(`Someone voted for ${vote.choice}`);
		if(vote.choice == 'cheezits'){
			results.cheezits++;
		}else if(vote.choice == 'goldfish'){
			results.goldfish++;
		}
		console.log(results);
		socket.broadcast.emit('results', {results: results});
	})

	socket.on("getResults", function(){
		socket.emit('results', {results: results});
	})
})