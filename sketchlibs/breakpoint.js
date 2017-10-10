"use strict";

function BreakpointManager() {
}

BreakpointManager.prototype = {
   breakpointsAreActive : false,
   isBlockedAtBreakpoint : false,
   // true MEANS BLOCKED,
   // UNBLOCKING WITH unblock() TEMPORARILY UNBLOCKS AND AUTO-BLOCKS ON NEXT
   // block() CHECK
   isBlocked : function() {
      if (!this.breakpointsAreActive) {
         return false;
      }
      if (this.isBlockedAtBreakpoint) {
         return true;
      }
      return false;
   },
   block : function() {
      if (!this.breakpointsAreActive) {
         return;
      }
      this.isBlockedAtBreakpoint = true;
   },
   unblock : function() {
      if (this.isBlockedAtBreakpoint) {
         this.isBlockedAtBreakpoint = false;
      }
   },
   enableBreakpoints : function(doUse) {
      this.breakpointsAreActive = doUse;
      this.isBlockedAtBreakpoint = false;
   }
};
