"use strict"

// FILE USED FOR SHARED 
// FLAGS, BITSETS, ENUM-LIKE DATA, AND SO ON

const UID_Flags = {
	HOST : -1,
	NULL : -2
};

const CT_CONFIG = {
	// UID assigned to the browser
    INSTANCE_ID : 0,
    IS_HOST : false,
    // ignore input redirected by other browser instances
    IGNORE_REMOTE_INPUT : true,
    // -1 means every user (browser or client) can draw,
    // any other UID indicates that this browser instance only responds to input from that UID
    CONTROL_USER_ID : -1 
    				
};

const DISPLAY_LIST_CONFIG = {
	IGNORE : false
}
