module.exports = {
	start : function(usingVive){
		if(usingVive){
			var sourceIP = "192.168.1.158";
			var framerate = 60.;
			var viveServer = dgram.createSocket('udp4');
			var calibratedSource = undefined
			var lighthouses = {}

			viveServer.bind({
			  address: sourceIP,
			  port: 10000,
			  reuseAddr: true,
			});
			viveServer.on('error', function(error) {
				console.log("Error: " + error);
				viveServer.close()
			});
			viveServer.on('close', function(){
				console.log('Vive socket closed.');
			});
			viveServer.on('listening', function(){
				var address = viveServer.address();
				console.log('\nVive listening on ' + address.address + ":" + address.port);
			}); 

			function isEmpty(obj) {
			  return Object.keys(obj).length === 0;
			}

			function tryAssignLighthouse(address, trackedObject) {
				if (!calibratedSource && viveServer.address().address == address)
					calibratedSource = address
				lighthouses[address] = trackedObject;
				//console.log(lighthouses);
			}

			function tryCalibrateObject(address, trackedObject) {
				if (!(calibratedSource) || calibratedSource == address) {
					return trackedObject;
				} 
				if (lighthouses[address] == undefined) {
					return trackedObject;
				}

				var toPos = trackedObject['vector3s'][0]
				toPos = new Vector3(toPos.x, toPos.y, toPos.z);
				var toRot = trackedObject['vector4s'][0]
				toRot = new Quaternion(toRot.x, toRot.y, toRot.z, toRot.w);

				var lh1 = lighthouses[calibratedSource];
				var lh1Pos = lh1['vector3s'][0]
				lh1Pos = new Vector3(lh1Pos.x, lh1Pos.y, lh1Pos.z);
				var lh1Rot = lh1['vector4s'][0]
				lh1Rot = new Quaternion(lh1Rot.x, lh1Rot.y, lh1Rot.z, lh1Rot.w);

				var lh2 = lighthouses[address];
				var lh2Pos = lh2['vector3s'][0]
				lh2Pos = new Vector3(lh2Pos.x, lh2Pos.y, lh2Pos.z);
				var lh2Rot = lh2['vector4s'][0]
				lh2Rot = new Quaternion(lh2Rot.x, lh2Rot.y, lh2Rot.z, lh2Rot.w);

				var tempQuat = lh1Rot.mul(lh2Rot.inverse());
				var deltaPos = lh1Pos.sub(tempQuat.mulVector3(lh2Pos));

				var newPos = deltaPos.add(tempQuat.mulVector3(toPos));
				var newRot = tempQuat.mul(toRot);

				trackedObject['vector3s'] = [{x: newPos.x, y: newPos.y, z:newPos.z}]
				trackedObject['vector4s'] = [{x: newRot.x, y: newRot.y, z: newRot.z, w: newRot.w}]

				return trackedObject;
			}

			var trackedObjects = [];
			var LHMappings = {};
			LHMappings["10.19.40.65"] = "REF-LH";
			LHMappings["10.19.164.43"] = "ZHU-LH";
			LHMappings["192.168.1.98"] = "HE-LH";
			LHMappings["192.168.1.107"] = "ZHU-LH";

			viveServer.on('message', function(message, info){
				var json = JSON.parse(message.toString());
				trackedObjects = [];
				for (var key in json) {
					if(!json.hasOwnProperty(key) || key == 'time'){
						continue;
					}
					var trackedObject = { 
						label: json[key].id,
						vector3s: [{x: parseFloat(json[key].x), y: parseFloat(json[key].y), z: -parseFloat(json[key].z)}],
						vector4s: [{x: parseFloat(json[key].qx), y: parseFloat(json[key].qy), z: -parseFloat(json[key].qz), w: -parseFloat(json[key].qw)}]
					};
					if (json[key]["triggerPress"] != undefined) {
						trackedObject['ints'] = [parseInt(json[key]['appMenuPress']), parseInt(json[key]['gripPress']), parseInt(json[key]['touchpadPress']), parseInt(json[key]['triggerPress']), 0, 0]
						//console.log(trackedObject['ints']);
						trackedObject['floats'] = [0., 0., 0., 0., 0., 0.]
					}
					
					if (trackedObject['label'].includes("LIGHTHOUSE-V2-4")) {
							
						tryAssignLighthouse(info.address, trackedObject);
						trackedObject.label = LHMappings[info.address];
						
						//console.log(trackedObject);
					}
					if (trackedObject['label'].includes("LIGHTHOUSE") && !trackedObject['label'].includes("V2-4")) {
						//Don't send lighthouses except for V2-4!
						continue;
					}
					
					// we don't sync vive controllers because it is only visible to the owner
					// we only need to broadcast THE lighthouse info of the calibratedSource, thus other 
					//trackedObject = tryCalibrateObject(info.address, trackedObject)
					if (trackedObject['label'] != undefined) {
						trackedObjects.push(trackedObject);
					}
					//pool[json[key].id] = trackedObject;
				}
			}); 

			setInterval(() => {
				if (!isEmpty(trackedObjects)) {
					holojam.Send(holojam.BuildUpdate('Vive', trackedObjects));
				}
			}, 1000./framerate);
		}
		/// end of viveServer
	}
}