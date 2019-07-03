var readline = require('readline');
var express = require('express');
var app = express();

// Local variables
var lastReq = 'a0.js'
var msgQueue = [];

app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
});


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "index.html" );
});

app.get('/zchat.css', function (req, res) {
    res.sendFile( __dirname + "/" + "zchat.css" );
});

app.get('/zchat.js', function (req, res) {
    res.sendFile( __dirname + "/" + "zchat.js" );
});

app.get('/*.js', function (req, res) {
    // Send data
    /*var msg = '[';
    for (var i=0; i<msgQueue.length; i++){
        msg += msgQueue[i];
        if ((i+1) < msgQueue.length){
            msg += ", ";
        }
    }
    msg += ']';
    res.send('appEl({data: ' + msg + ', id: "' + req.url + '"});');*/
    res.send('appEl({data: ' + JSON.stringify(msgQueue) + ', id: "' + req.url + '"});');
    msgQueue = [];
});

app.get('/*.rq', function(req, res){
    // Send data
    var id = req.url.split('.')[0];
    id = id.replace(/\/+/g, '');
    res.send('avEl({data: "https://secondlife.com/app/image/f8b61a72-d21e-4d30-b42b-04a23fde9eda/1", id: "' + id + '"});');
});

// Listen on port
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
   
    console.log("ZChat server listening at http://localhost:%s", port);
    
    // Read input from user
    var rl = readline.createInterface({input: process.stdin, output: process.stdout});
    var recLoop = function(){
        rl.question('Input> ', function (answer) {
            msgQueue.push({"id": "b45c59dc-ddb7-428e-9cfc-fc0f87f30cca", "data": answer, "uname": "lxw404", "dname": "Lux"});
            recLoop();
        });
    };
    recLoop();
});