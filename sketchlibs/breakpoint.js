"use strict";

function BreakpointController() {
   this.isBlockedAtBreakpoint = false;
}

BreakpointController.prototype = {
   // true MEANS BLOCKED,
   // UNBLOCKING WITH unblock() TEMPORARILY UNBLOCKS AND AUTO-BLOCKS ON NEXT
   // block() CHECK
   isBlocked : function() {
      return this.isBlockedAtBreakpoint;
   },
   block : function() {
      this.isBlockedAtBreakpoint = true;
      return true;
   },
   unblock : function() {
      this.isBlockedAtBreakpoint = false;
   }
};
