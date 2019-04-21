// behave as a relay
const holojam = require('holojam-node')(['relay']);
const Uint64LE = require("int64-buffer").Uint64LE;
var parseArgs = require('minimist');
const ip = require('ip');

var resolutionHeight = 800;
var resolutionWidth = 600;

//These will get unicast to
var saved_ips = [];
// pair of avatar name and avatar oculusUserID
var mapAvatarId = {};
var globalStylusID = 0;
var curStylusID = -1; // -1 means no one or browser

function readHeader(data) {
   let header = data.toString('ascii', 1, 2);
   header += data.toString('ascii', 0, 1);
   header += data.toString('ascii', 3, 4);
   header += data.toString('ascii', 2, 3);
   header += data.toString('ascii', 5, 6);
   header += data.toString('ascii', 4, 5);
   header += data.toString('ascii', 7, 8);
   header += data.toString('ascii', 6, 7);
   return header;
}

var CommandFromClient = Object.freeze({
	"RESOLUTION_REQUEST":0, "STYLUS_RESET":1, "SKETCHPAGE_CREATE":2, "AVATAR_SYNC":3,
	"SKETCHPAGE_SET":4, "INIT_COMBINE":5, "SELECT_CTOBJECT":6, "DESELECT_CTOBJECT":7, 
	"AVATAR_LEAVE":8, "MOVE_FW_BW_CTOBJECT":9, "UPDATE_STYLUS_Z":10, "AVATAR_LEAVE_REMOVE_ID":11, 
	"TOGGLE_PALETTE":12, "MESH_ASSET_REQUEST" : 13, "MESH_ASSET_DELETION_ACK" : 14
});

function MeshData() {
	// contains vertex and triangle index lists
	this.idxToSubMeshes = [];
}
function CachedClientData() {
	// contains MeshData
	this.sketchIDToMeshMap = {

	};
}

const cachedData = new CachedClientData();

var CommandToClient = Object.freeze({"RESOLUTION_REQUEST":0, "STYLUS_RESET":1, "SKETCHPAGE_CREATE":2, "AVATAR_SYNC":3});

function ProcessMSGSender(flake, ws){
	// buffer array for holojam to send back
	var bufLength = 0;
	var bufArray = new Array(0);
	
	let b = new Buffer(flake.bytes);
	var cursor = 0;
	var cmdCount = b.readInt32LE(cursor);
	cursor += 4;
	console.log("\nReceiving cmdCount:" + cmdCount);
	for(var cmdIndex = 0; cmdIndex < cmdCount; cmdIndex++){
		var cmdNumber = b.readInt32LE(cursor);
		cursor += 4;
		var paraCount = b.readInt32LE(cursor);
		cursor += 4;
		console.log("\tcursor", cursor, "\ncmdNumber:" + cmdNumber + "\tparaCount:" + paraCount);
		switch(cmdNumber) {
			case CommandFromClient.RESOLUTION_REQUEST:
				var e = {
					eventType: "clientGetResolution",
					event: {}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.STYLUS_RESET:
				console.log("reset stylus:" + b.readInt32LE(cursor) + " when current is " + curStylusID);
				const STYLUS_ID = b.readInt32LE(cursor);
				var setStylus = b.readInt32LE(cursor+4);	//1 means set and -1 means release
				
				if((curStylusID == -1) && (setStylus == 1) ){
					// give the control
					console.log("\tgive the control");
					curStylusID = STYLUS_ID;
				}
				else if((curStylusID == STYLUS_ID) && (setStylus == -1)){
					// reset the control
					console.log("\trelease the control");
					curStylusID = -1;
				}else{
					// reject
					console.log("\tno change with " + STYLUS_ID	+" " + setStylus);
				}
				var curbuf = Buffer.allocUnsafe(4);
				curbuf.writeInt16LE(cmdNumber,0);// 1 for reset stylus id
				curbuf.writeInt16LE(curStylusID,2);// stylus id// index 4 is the count of parameter so skip
				bufLength += curbuf.length;
				bufArray.push(curbuf);								

				var eventLocal = {
					eventType: "disableSelectionForAllOtherClients",
					event: {uid : curStylusID}
				};
				ws.send(JSON.stringify(eventLocal));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.SKETCHPAGE_CREATE:
				console.log("(client -> server) create new sketchPage:" + b.readInt32LE(cursor));
				console.log("(client -> server) set page immediately? " + b.readInt32LE(cursor+4));
				console.log(b);
				var e = {
					eventType: "clientCreateSketchPage",
					event: {setImmediately : b.readInt32LE(cursor + 4), id: b.readInt32LE(cursor)}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.AVATAR_SYNC:
				var avatarname = b.toString('utf8',cursor,cursor+paraCount);//nStr = paraCount
				console.log("\treceive new avatar nStr:" + paraCount + "\tb.length:" + b.length + "\t" + avatarname );
				var avatarid = new Uint64LE(b, cursor+paraCount);
				cursor += 8;
				console.log(avatarid-0);
				// add to map
				mapAvatarId[avatarname] = avatarid;
				
				// calculate the size of nStr + name + id
				var nBuf = 2+2;
				Object.entries(mapAvatarId).forEach(([key, value]) => {
					nBuf += 2 + key.length + 8;
				});
				// return back the avatarname with the assigned id
				nBuf += 2 + avatarname.length + 2;
				var curbuf = Buffer.allocUnsafe(nBuf);
				curbuf.writeInt16LE(cmdNumber,0);// 3 for avatar number
				curbuf.writeInt16LE(Object.entries(mapAvatarId).length,2);// for avatar amount
				console.log("\tcurbuf:" + curbuf + "\tObject.entries(mapAvatarId).length:\t" + Object.entries(mapAvatarId).length);
				var index = 4;
				Object.entries(mapAvatarId).forEach(([key, value]) => {
					curbuf.writeInt16LE(key.length,index);// avatar number's length
					index += 2;
					curbuf.write(key,index,key.length);
					index += key.length;
					var uintID = new Uint64LE(value);
					uintID.toBuffer().copy(curbuf, index, 0, 8);								
					index += 8;
				});
				curbuf.writeInt16LE(avatarname.length, index);
				index += 2;
				curbuf.write(avatarname,index,avatarname.length);
				index += avatarname.length;
				curbuf.writeInt16LE(globalStylusID++,index);
				index += 2;
				//console.log("test:" + curbuf);
				bufLength += curbuf.length;
				bufArray.push(curbuf);
				//holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
//									label: 'MSGRcv', bytes: buf
				//}]));
				cursor += paraCount;
				console.log("\tcursor", cursor);

				var e = {
					eventType : "clientAddUserID",
					event : {uid : globalStylusID - 1}
				};
				ws.send(JSON.stringify(e));
				break;
			case CommandFromClient.SKETCHPAGE_SET:
				const idx = b.readInt32LE(cursor);
				console.log("in server, set page: " + idx);
				var e = {
					eventType: "clientSetSketchPage",
					event: {index : idx}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.INIT_COMBINE:
				console.log("Get initialization data");
				var e = {
					eventType : "clientInitialize",
					event : {}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.SELECT_CTOBJECT:
				var ts = b.readInt32LE(cursor);
				var uid = b.readInt32LE(cursor + 4);
				console.log(("(server -> client) selection on at framecount=[" + ts + "]"));
				var e = {
					eventType: "clientBeginMoveGroupOrSketchFromPage",
					event: {timestamp : ts, uid : uid}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;

			case CommandFromClient.DESELECT_CTOBJECT:
				var ts = b.readInt32LE(cursor);
				var dstPId = b.readInt32LE(cursor + 4);
				var uid = b.readInt32LE(cursor + 8);
				console.log(("(server -> client) selection off at framecount=[" + ts + "], dst page: " + dstPId));
				var e = {
					eventType : "clientEndMoveGroupOrSketchFromPage",
					event : {
						timestamp : ts,
						dstPageIdx : dstPId,
						uid : uid
					}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;	
			case CommandFromClient.AVATAR_LEAVE:
				console.log("Someone is leaving");
				var avatarname = b.toString('utf8',cursor,cursor+paraCount);//nStr = paraCount
				console.log("\treceive new avatar nStr:" + paraCount + "\tb.length:" + b.length + "\t" + avatarname );
				var avatarid = new Uint64LE(b, cursor+paraCount);
				cursor += 8;
				delete mapAvatarId[avatarname]
				
				console.log("Object.entries(mapAvatarId).length:\t" + Object.entries(mapAvatarId).length);
				
				// broadcast who is leaving
				// calculate the size of cmdNumber + avatarname.length + avatarname
				var nBuf = 2 + 2 + avatarname.length;
				var curbuf = Buffer.allocUnsafe(nBuf);
				var index = 0;
				curbuf.writeInt16LE(cmdNumber,index);
				index += 2;
				curbuf.writeInt16LE(avatarname.length,index);
				index += 2;
				curbuf.write(avatarname,index,avatarname.length);
				index += avatarname.length;
				
				bufLength += curbuf.length;
				bufArray.push(curbuf);
				
				cursor += paraCount;
				console.log("\tcursor", cursor);

				break;
			case CommandFromClient.MOVE_FW_BW_CTOBJECT:
				console.log("(server -> client) received command to start or finish moving CTObject backward and forward");
				
				var ts = b.readInt32LE(cursor);
				var opt = b.readInt32LE(cursor + 4);
				var uid = b.readInt32LE(cursor + 8);

				var e = {
					eventType: "clientBeginOrFinishMovingBackwardsOrForwards",
					event : {
						timestamp : ts,
						option : opt,
						uid : uid
					}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.AVATAR_LEAVE_REMOVE_ID:
				console.log("removing ID");

				var uid = b.readInt32LE(cursor);

				var e = {
					eventType : "clientRemoveUserID",
					event : {uid : uid}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;
				break;
			case CommandFromClient.TOGGLE_PALETTE:
				const remoteUID = b.readInt32LE(cursor);
				const paletteStatus = b.readInt32LE(cursor + 4);

				var e = {
					eventType : "clientEnablePalette",
					event : {uid : uid, turnOnPalette : paletteStatus}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;

				break;
			case CommandFromClient.MESH_ASSET_REQUEST:
				const _timeStamp = b.readInt32LE(cursor);
				const _remoteUID = b.readInt32LE(cursor + 4);
				const _meshAssetID = b.readInt32LE(cursor + 8);

				var e = {
					eventType : "clientRequestMeshAsset",
					event : {timestamp : _timeStamp, uid : _remoteUID, mid : _meshAssetID}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;

				break;
			case CommandFromClient.MESH_ASSET_DELETION_ACK:
				const __timeStamp = b.readInt32LE(cursor);
				const __remoteUID = b.readInt32LE(cursor + 4);
				const __meshAssetID = b.readInt32LE(cursor + 8);

				var e = {
					eventType : "clientMeshAssetDeletionAck",
					event : {timestamp : __timeStamp, uid : __remoteUID, mid : __meshAssetID}
				};
				ws.send(JSON.stringify(e));
				cursor += paraCount * 4;

				break;
			default:
				console.error("UNEXPECTED COMMAND");
				break;
		}
	}
	var bufLengthByte = Buffer.allocUnsafe(2);
	var bufCursor = 0;
	console.log("\tbufArray.length:" + bufArray.length);
	if(bufArray.length > 0){
		bufLengthByte.writeInt16LE(bufArray.length,bufCursor);  
		bufArray.splice(0, 0, bufLengthByte);	// insert cmd count into the front
		var buf = Buffer.concat(bufArray);
		//console.log("buf", buf);	
		holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
			label: 'MSGRcv', bytes: buf
		}]));	
	}else{
		// add an empty return
		var buf = Buffer.allocUnsafe(2);
		buf.writeInt16LE(0,0);// cmdCount = 0
		holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
			label: 'MSGRcv', bytes: buf
		}]));	
	}
}

function ProcessFlakes(flakes, ws){
	for (var i=0; i < flakes.length; i++) {
		var flake = flakes[i];
		//console.log(flake.label);
		if(flake.label.contains("Stylus")){
			const wheelX = flake.floats[0];
			const wheelY = flake.floats[1];
			const USER_ID = flake.ints[2];
			const TIMESTAMP = flake.ints[3];
			const LOCAL_BOARD_ID = flake.ints[4];

			var wipeOrNot = flake.ints[1];
			if(wipeOrNot == 3){
				console.log("recv wipe");
				var e = {
				   eventType: "wipe",
				   event: {
					  button: 1,
					  clientX: 0,
					  clientY: 0,
					  wheelX: wheelX,
					  wheelY: wheelY,
					  uid: USER_ID,
					  timestamp: TIMESTAMP,
					  isMR: true,
					  pageIdx: LOCAL_BOARD_ID
				   }
				};
				ws.send(JSON.stringify(e));	
			}
			else{
				var type = flake.ints[0];
				type = (type == 0 ? "onmousedown"
				: (type == 1 ? "onmousemove" :"onmouseup" ));
				var e = {
				   eventType: type,
				   event: {
					  button: 3,
					  clientX: flake.vector3s[0].x * resolutionWidth,
					  clientY: flake.vector3s[0].y * resolutionHeight,
					  wheelX: wheelX,
					  wheelY: wheelY,
					  uid: USER_ID,
					  timestamp: TIMESTAMP,
					  isMR: true,
					  pageIdx: LOCAL_BOARD_ID
				   }
				};
				ws.send(JSON.stringify(e));		
			}
		}
		else if(flake.label.contains("Selection")){
			const wheelX = flake.floats[0];
			const wheelY = flake.floats[1];
			const USER_ID = flake.ints[0];
			const TIMESTAMP = flake.ints[1];
			const LOCAL_BOARD_ID = flake.ints[2];

				var type = "onmousemoveNonHost";
				//console.log(flake.ints[0]);
				//console.log("type",type);
				var e = {
				   eventType: type,
				   event: {
					  button: 3,
					  clientX: flake.vector3s[0].x * resolutionWidth,
					  clientY: flake.vector3s[0].y * resolutionHeight,
					  wheelX: wheelX,
					  wheelY: wheelY,
					  uid: USER_ID,
					  timestamp: TIMESTAMP,
					  isMR: true,
					  pageIdx: LOCAL_BOARD_ID
				   }
				};
				ws.send(JSON.stringify(e));		

		}
		else if(flake.label.contains("MSGSender")){	
			ProcessMSGSender(flake, ws);
		}
	}
}

module.exports = {
	processChalktalk: function (data) {
		// init buf for sending to holojam for every message
		var bufLengthByte = Buffer.allocUnsafe(2);
		var bufLength = 0;
		var buf = Buffer.allocUnsafe(0);

		bufLengthByte.writeInt16LE(bufLength,0);  
		const headerString = readHeader(data);
		if (headerString == 'CTdata01') {
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
			   label: 'Display',
			   bytes: data
			}]));
		}else if (headerString == 'CTDspl01'){
			var curbuf = Buffer.allocUnsafe(6);
			curbuf.writeInt16LE(0,0);// 0 for resolution
			curbuf.writeInt16LE(data.readInt16LE(8),2);// 2 for resolution
			curbuf.writeInt16LE( data.readInt16LE(10),4);// 4 for resolution
			
			++bufLength;
			console.log("\tbuf before\t", buf);
			buf = Buffer.concat([buf, curbuf]);
			console.log("\tbuf after\t", buf);

			resolutionWidth = data.readInt16LE(8);
			resolutionHeight = data.readInt16LE(10);					
			console.log("\nreply from client:\t")
			console.log(resolutionWidth,resolutionHeight);
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv2 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv2', bytes: entirebuf
			}]));
		}
		else if(headerString == 'CTmesh01') {
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'DisplayMesh', bytes: data
			}]));
		}else if (headerString == 'CTPcrt01') {
			var curbuf = Buffer.allocUnsafe(6);
			curbuf.writeInt16LE(2,0);// 2 for creating sketchpage
			curbuf.writeInt16LE(data.readInt16LE(8),2);// new page id
			curbuf.writeInt16LE(data.readInt16LE(10), 4); // whether page should be set immediately
			
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);

			var boardCnt = data.readInt16LE(8);
			console.log("\nreply from client: create a new sketchPages with id:" + boardCnt);
			console.log("\t{\t(server -> client) create sketch page with id: " + boardCnt + "\t}");    

			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv3 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv3', bytes: entirebuf
			}]));		     		
		}
		else if (headerString == 'CTPset01') {
			var curbuf = Buffer.allocUnsafe(6);
			curbuf.writeInt16LE(4,0); // 4 for setting sketch page
			curbuf.writeInt16LE(data.readInt16LE(8), 2); // write page id
			
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);

			var boardCnt = data.readInt16LE(8);
			console.log("\nreply from client:", "(server -> client) set sketch page with id: " + boardCnt);
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv4 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv4', bytes: entirebuf
			}]));
		}
		else if (headerString == 'CTInit01') {
			var curbuf = Buffer.allocUnsafe(8); // write 4 int16s

			curbuf.writeInt16LE(5, 0); // init command

			const roff = 8; // read offset
			const woff = 2; // write offset

			curbuf.writeInt16LE(data.readInt16LE(roff),     woff);     // resolution x
			curbuf.writeInt16LE(data.readInt16LE(roff + 2), woff + 2); // resolution y
			curbuf.writeInt16LE(data.readInt16LE(roff + 4), woff + 4); // page index
			
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);
	
			console.log("\nreply from client:", 
				"(server -> client) initializing with resolution[" + 
				data.readInt16LE(roff) + ", " + data.readInt16LE(roff + 2) + "]" +
				"and page index[" + data.readInt16LE(roff + 4) + "]"
			);
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv5 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv5', bytes: entirebuf
			}]));
		}
		else if (headerString == 'CTBrdon?') { // temporary board on? (could be rejected if there's nothing to move between boards)
			var curbuf = Buffer.allocUnsafe(10); 

			curbuf.writeInt16LE(6, 0); // board on command

			const roff = 8; // read offset
			const woff = 2; // write offset

			curbuf.writeInt16LE(data.readInt16LE(roff), woff);         // uid
			curbuf.writeInt16LE(data.readInt16LE(roff + 2), woff + 2); // timestamp half-1
			curbuf.writeInt16LE(data.readInt16LE(roff + 4), woff + 4); // timestamp half-2
			curbuf.writeInt16LE(data.readInt16LE(roff + 6), woff + 6); // whether a chalktalk object was selected
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);
			
			console.log("board on?: " + data.readInt16LE(roff + 6));
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv6 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv6', bytes: entirebuf
			}]));
		}
		else if (headerString == 'CTBrdoff') { // turns off the tempoary board
			var curbuf = Buffer.allocUnsafe(10);

			curbuf.writeInt16LE(7, 0); // board off command

			const roff = 8; // read offset
			const woff = 2; // write offset

			curbuf.writeInt16LE(data.readInt16LE(roff), woff);         // uid
			curbuf.writeInt16LE(data.readInt16LE(roff + 2), woff + 2); // timestamp half-1
			curbuf.writeInt16LE(data.readInt16LE(roff + 4), woff + 4); // timestamp half-2
			curbuf.writeInt16LE(data.readInt16LE(roff + 6), woff + 6); // whether a chalktalk object was selected
			
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv7 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv7', bytes: entirebuf
			}]));
		}
		else if (headerString == 'CTzOff01') {
			console.log("(client -> server) sending z offset");
			try {
				var curbuf = Buffer.allocUnsafe(10);

				curbuf.writeInt16LE(9, 0) // stylus z offset 

				const roff = 8; // read offset
				const woff = 2; // write offset

				curbuf.writeInt16LE(data.readInt16LE(roff), woff);         // timestamp half-1
				curbuf.writeInt16LE(data.readInt16LE(roff + 2), woff + 2); // timestamp half-2
				curbuf.writeInt16LE(data.readInt16LE(roff + 4), woff + 4); // z offset half-1
				curbuf.writeInt16LE(data.readInt16LE(roff + 6), woff + 6); // z offset half-2

				++bufLength;
				buf = Buffer.concat([buf, curbuf]);

				bufLengthByte.writeInt16LE(bufLength,0);  
				var entirebuf = Buffer.concat([bufLengthByte, buf]);
				console.log("Sending MSGRcv8 with", bufLength, " commands");

				holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
					label: 'MSGRcv8', bytes: entirebuf
				}]))
			} catch (e) {
				console.log(e);
			}
		}
		else if (headerString == 'CTReStyl') { // turns off the tempoary board
			var curbuf = Buffer.allocUnsafe(4);
			curStylusID = -1;

			curbuf.writeInt16LE(CommandToClient.STYLUS_RESET, 0); // reset the stylus
			curbuf.writeInt16LE(curStylusID, 2);     // -1 means broswer
			
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);
			console.log("Sending MSGRcv9 with", bufLength, " commands");
			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				label: 'MSGRcv9', bytes: entirebuf
			}]));
		}
		else if (headerString == 'CTReSlct') { // reset selections

			var curbuf = Buffer.allocUnsafe(2); 

			curbuf.writeInt16LE(10, 0); // board on command

			++bufLength;
			buf = Buffer.concat([buf, curbuf]);
			
			console.log("resetting selection");
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);

			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
					label: 'MSGRcv5', bytes: entirebuf
			}]));
		}
		else if (headerString == 'CTCountD') { // reset selections

			var curbuf = Buffer.allocUnsafe(4); 

			curbuf.writeInt16LE(11, 0); // count down command
			curbuf.writeInt16LE(data.readInt16LE(8), 2);
			++bufLength;
			buf = Buffer.concat([buf, curbuf]);
			
			console.log("start count down:" + data.readInt16LE(8));
			
			bufLengthByte.writeInt16LE(bufLength,0);  
			var entirebuf = Buffer.concat([bufLengthByte, buf]);

			holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
					label: 'MSGRcv10', bytes: entirebuf
			}]));
		}
	},
	processUnity: function(ws){
		holojam.on('update', (flakes, scope, origin) => {
			//console.log("ws.readyState",ws.readyState);
			if(ws.readyState != 1){
				//console.log("when null? ws.readyState",ws.readyState);
				// add an empty return
				//var buf = Buffer.allocUnsafe(2);
				//buf.writeInt16LE(0,0);// cmdCount = 0
				//holojam.Send(holojam.BuildUpdate('ChalkTalk', [{
				//	label: 'MSGRcv', bytes: buf
				//}]));	
				return;
			}
			//
			ProcessFlakes(flakes, ws);
		});
	},
	processArgs: function(args){
		var argv = parseArgs(args);
		argv._.forEach(function(ipaddr){
			console.log("add " + ipaddr + " to unicast list");
			saved_ips.push(ipaddr);
			console.log("DEBUG saved_ips " + saved_ips);
		});
		if(argv.send == "all"){
			saved_ips = ["172.24.71.247", "172.24.71.215", "172.24.71.208", "172.24.71.240"];	
			console.log("send to " + saved_ips);
		}else{
			saved_ips.push(ip.address());
			console.log("send to self in addition to unicast " + saved_ips);
		}
		if (!holojam.ucAddresses) {
			holojam.ucAddresses = [];
		}
		holojam.ucAddresses = holojam.ucAddresses.concat(saved_ips);

	}
}