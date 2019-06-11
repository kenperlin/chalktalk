"use strict";

// add and delete userIDs when they become active/inactive
const userIDs = [];
let deferredUserFunctions = new DeferredUserFunctions();

function DeferredFunctionsUserRecord() {
	this.functions = {};
}

function getOrCreateDeferredFunctionsUserRecord(uid) {
	let userRecord = deferredUserFunctions.uidToFunctions[uid];
	if (!userRecord) {
		 userRecord = new DeferredFunctionsUserRecord();
		 deferredUserFunctions.uidToFunctions[uid] = userRecord;
	}
	return userRecord;         
}

function DeferredUserFunctions() {
	this.uidToFunctions = {}; // stores DeferredFunctionsUserRecords
}

function UserCursor() {
	this.x = 0.0;
	this.y = 0.0;
	this.lastX = 0.0;
	this.lastY = 0.0;

	this.prevWheelX = 0.0;
	this.prevWheelY = 0.0;
	this.wheelX     = 0.0;
	this.wheelY     = 0.0;
	this.prevWheelActive = false;
	this.wheelRecenteredCount = 0;
}

function UserRecord(uid, isBrowser = false) {
	this.uid = uid;
	this.isBrowser = isBrowser;
	this.selectedCTObject = new CTObjectSelection();
	this.fwbwSelection    = new FWBWSelection();

	this.sketchAction = null;
	this.actionindex = -1;
	this.sketchActionClientTimestamp = 0;
	this.sketchActionServerTimestamp = time;

	this.rotate_travel = 0;
	this.rotate_x = 0;
	this.rotate_y = 0;

	this.cursor           = new UserCursor();
}

function UserMap() {
	// map uid to selection info // stores UserRecords
	this.uidToRecords = {};
}

function getOrCreateUserRecord(uid, isBrowser = false) {
	let userRecord = userMap.uidToRecords[uid];
	if (!userRecord) {
	 userRecord = new UserRecord(uid, isBrowser);
	 userMap.uidToRecords[uid] = userRecord;
	}
	return userRecord;
}

let userMap = new UserMap();