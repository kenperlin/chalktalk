//Setup ----, copied from sender.js
var IPSource = ''; // the ip used to run this client (if there is a nat proxy, the ip of the nat), leave empty for autodetect
var IPControl  = '128.122.215.23'; // the ip of the sync server to connect to
var TCPControl = 20010; // the control port that is used on the server
var username = "Testuser"; //username to connect as
var password = "Testpassword"; //password to coinnect with
// End Setup ---

var os = require('os');
var ifaces = os.networkInterfaces();
var route = require('default-network');
// make udp global
var dgram = require('dgram');
var udp = dgram.createSocket('udp4');
var isReady = false;
var udpPort = 0;
var streamid = '';	
var header_size = Buffer.alloc(6);

function start() {

	var token = '';
	var lastfunction = '';
	var running = false;
	var laststart = 0;
	var processing = [];	
	var sourcePort = 0;
	
	
	// chalktalk
	var type="CT";
	

	//set up udp to send data to the relay
	udp.bind();

	udp.on('listening', () => {
	  const address = udp.address();
	  sourcePort = address.port;
	  console.log(`Bound to: ${address.address}:${address.port}`);
	});


	//processing functions to setup the connections
	processing['Login'] = new Object({
		start: function() {
			console.log("logining start");
			var request = '{"function":"auth","username":"'+username+'","password":"'+password+'"}';
			client.write(request);
		},
		process: function(message){
			console.log("logining process");
			if('token' in message) {
				token = message['token'];
				IPSource = message['ip'];
				console.log('  Authentication successful. Token: '+token+', IP: '+IPSource);
			} else
				console.log('  Request produced wrong result');
			return('continue');
		}
	});

	processing['GetStream'] = new Object({
		start: function() {
			var request = '{"function":"sender","workspace":"Holodeck","proto":"udp","ip":"'+IPSource+'","port":'+sourcePort+',"type":"' + type + '","token":"'+token+'"}';
			console.log("GetStream-sending\t" + request);
			client.write(request);
		},
		process: function(message){
			if('streamid' in message) {
				streamid = message['streamid'];
				udpPort = message['port'];
				console.log('  Aquired a new streamid:'+streamid+', Port:'+udpPort);

			} else {
				console.log('Did not get a streamid.');
				return('error');
			}
			return('done');
		}
	});

	processing['DisconnectStream'] = new Object({
		start: function() {
			var request = '{"function":"disconnect","streamid":"'+streamid+'","token":"'+token+'"}';
			client.write(request);
			console.log('Disconnecting stream: '+streamid);
			process.exit();
		},
		process: function(message){
			return('done');
		}
	});
	
	
	// Client functions to deal with the control connections 
	var net = require('net');
	var client = new net.Socket();
	client.on('data', function(data) {
		console.log('received data: '+data);
		
		// try to parse data from server
		try {
			message = JSON.parse(data);
		} catch (e) {
			console.log('Received message not a proper JSON:'+data.toString());
			return;
		}
		
		// processing function send by server for instance to change or close the connection
		if('function' in message) {
			console.log('checking for correct function');
			return;
		}

		// processing result received by server
		if('statuscode' in message) {
//			console.log("message['statuscode']:" + message['statuscode']);
			if(message['statuscode']!=0) {
				console.log('  Function result was an error.');
				if('message' in message) {
					console.log('  '+message['message']);
				}
				return;
			}

			// processing result of a request from server
			var result = processing[lastfunction].process(message);
			console.log("result:" + result + "\tlastfunction:" + lastfunction);
			if(result=='continue') {
				running= false;
				runClient(lastfunction);
			}
			
			// after succesful login and stream aquisition start sending packets
			if(result=='done')
				//Chalktalk
				isReady = true;
				//sendChalktalk();

			return;
		}
		console.log('Message not understood: ' + data.toString());
	});

	// for now exit when control connection is lost (we should reestablish this)
	client.on('close', function() {
		console.log('Contorol connection closed.');
		process.exit();
	});

	client.connect(TCPControl, IPControl, function() {
		console.log('Connected, Starting...');
		runClient();
	});

	var next = function(db, key) {
		var keys = Object.keys(db);
		if(key==null)
			return keys[0];
		else
			for (var i = 0; i < keys.length; i++)
				if (keys[i] === key)
					return keys[i + 1];
	};

	function runClient(func = null) {
		var i = next(processing,func);
		if(typeof i != "undefined") {
			console.log('Working on > ' + i);
			lastfunction = i;
			running = true;
			laststart = Date.now();
			processing[i].start();
		}else {
			console.log('Finished...');
			client.destroy();
		}
	}

	//send disconnect signal to server so the connections are managed properly
	function cleanup() {
		client.connect(TCPControl, IPControl, function() {
			console.log('Connected to control');
			processing['DisconnectStream'].start();
		});
	}

	process.on('SIGINT', cleanup);
}

module.exports = {
	sendChalktalk: function (data) {
		if(!isReady){
			console.log("not ready");
			return;
		}

		//console.log(`running with target ${IPControl}:${udpPort}`);

		function sendData(data) {
			var header = {
				id : streamid,
				time: Date.now()
			};
			header = JSON.stringify(header);
			header = Buffer.from(header);
			data = Buffer.from(data);
			header_size.writeUInt16LE(header.length,0);
			header_size.writeUInt32LE(data.length,2);
			//console.log("data.length:" + data.length);
			
			var packet = [header_size,header,data];
			message = Buffer.concat(packet);

			udp.send(message, udpPort, IPControl, (err) => {
				if (err) {
					console.log('socket error', err);
				}
			});

			//console.log(`sent: ${message.toString()} to ${IPControl}:${udpPort}`);
		}

		sendData(data);
	},
	runWrapper: function(){
		// copied from sender.js
		route.collect(function(error, data) {
			
			// get bind IP from the default route
			if(IPSource=='') {
				names = os.networkInterfaces()[Object.keys(data)[0]];
				for(i=0; i<names.length; i++){
				  if(names[i]['family']=='IPv4')
					  IPSource=names[i]['address'];
				}
			}

			//check if we got a source ip
			if(IPSource=='') {
				console.log('Did not find proper IP address.');
				process.exit();
			}
			start();
		});
	}
}