module.exports = {
	start : function(using3DOF){
		////////////////////////////////////////////////////////////////////////////////
		//////////////////// Android Simulation
		////////////////////////////////////////////////////////////////////////////////

		if(using3DOF){
		// for sending ack back to 3dof phone to confirm the connection
			var ackclient = dgram.createSocket('udp4');
			// listen to android simulation through udp
			const udpServer = dgram.createSocket('udp4');
			var udpHOST = process.argv[3] || "192.168.1.126";

			udpServer.on('error', (err) => {
			  //console.log(`udpServer error:\n${err.stack}`);
			  console.log("udpServer closed because no android simulation needs to be listened now");
			  udpServer.close();
			});

			var PORT = 11000;
			//var HOST = '216.165.71.243';

			udpServer.on('listening', function () {
				var address = udpServer.address();
				console.log('UDP udpServer listening on ' + address.address + ":" + address.port);
				
			});

			//
			// Summary:
			//   Began = 1,  A finger touched the screen.
			//   Moved = 2,   A finger moved on the screen.
			//   Stationary = 3,  A finger is touching the screen but hasn't moved.
			//  Ended = 4,   A finger was lifted from the screen. This is the final phase of a touch.
			//  Canceled = 5   The system cancelled tracking for the touch.
			var curDaydreamInput = {
				threedof:true,
				rx:0,
				ry:0,
				rz:0,
				state:0,
				x:0,
				y:0
			};

			udpServer.on('message', function (message, remote) {
				//console.log(remote.address + ':' + remote.port +' - ' + message + message.length);
				
				if(new String(message).contains("Is anybody there?"))
					ackclient.send(message, 0, message.length, remote.port, remote.address, function(err, bytes) {
						//console.log('UDP message sent to ' + remote.address +':'+ remote.port);
						if (err) 
							ackclient.close();
					});
				
				if(message.length != 24)
					return;
				var index = 0;
				curDaydreamInput.rx = message.readFloatLE(index);
				index += 4;
				curDaydreamInput.ry = message.readFloatLE(index);
				index += 4;
				curDaydreamInput.rz = message.readFloatLE(index);
				index += 4;
				curDaydreamInput.state = message.readInt32LE(index);
				index += 4;
				curDaydreamInput.x = message.readFloatLE(index);
				index += 4;
				curDaydreamInput.y = message.readFloatLE(index);
				
				//console.log(rx,ry,rz,state,x,y);
				//console.log(curDaydreamInput);
			});

			udpServer.bind(PORT, udpHOST);
			
			// zhenyi: send 3dof cursor
			setInterval( function() { sendDaydreamInput(); }, 20);
			function sendDaydreamInput(){
				if(curWS != null){
					curWS.send(JSON.stringify(curDaydreamInput));
				}
			}
		}
		// end of udp server
	}
}