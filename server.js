"use strict"
var express = require("express");
var path = require("path");
var app = express();
var port = 8000;

const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');

const {TOKEN_SECRET} = require('./config');

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "static")));
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

var results = {cheezits: 0, goldfish: 0};

const authenticate = (req, res, next) => {
	const token = req.cookies.token;



	console.log(typeof uuidv4());

	if(token) {
		jwt.verify(token, TOKEN_SECRET, (err, payload) => {
			if(err) next();
			res.redirect('/results');
		})
	} else {
		const newToken = jwt.sign({
			id: uuidv4()
		}, TOKEN_SECRET);

		res.cookie('token', newToken, {maxAge: 1000*86400*30, httpOnly: true});
		console.log('entered else');

		next();
	}
}

app.get('/', authenticate, function(req, res){
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