//===========================define variable
var app = require('express')(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

//======================config
var session = require("express-session")({
	    secret: "my-secret",
	    resave: true,
	    saveUninitialized: true
  	}),
  	sharedsession = require("express-socket.io-session");
  	// Attach session
	app.use(session);
	// Share session with io sockets
	io.use(sharedsession(session));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({    
  extended: true
}));

//===========================route
server.listen(5211, function(req, res){
	console.log('running');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
app.post('/set_name', function(req, res){
	var name = req.body.name;
	if(name != ''&&name != null) {
		req.session.name = req.body.name;
		res.redirect('/chat');
	} else {
		delete req.session.name;
		res.redirect('/');
	}
})
app.get('/chat', function(req, res){
	res.sendFile(__dirname + '/views/chat.html');
});
//===========================
io.sockets.on('connection', function(socket) {

	socket.on('chat', function(data){
		socket.emit('notice', {sync: 1, name: socket.handshake.session.name, message: data.message});
		console.log('socket:'+socket.handshake.session.name);
		socket.broadcast.emit('notice', {name: socket.handshake.session.name, message: data.message});
	});
});