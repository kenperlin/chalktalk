
let HistoryQueue = (function() {

   let _hs = {};
   // QUEUE TO SAVE STATES AND MOVE BACKWARDS AND FORWARDS IN "TIME",
   // MAIN USE CASE: UNDO / REDO BUFFER
   function HistoryQueue() {
      this.idx = -1;
      this.states = [];
   } 

   HistoryQueue.prototype = {
      // SAVE CURRENT STATE (INVALIDATES ALL FUTURE STATES)
      // args :
      //    state (should be a copy of the current state to store in the history record)
      saveState : function(state) {        
         this.states.splice(this.idx + 1);
         this.states.push(state);
         
         this.idx++;
      },
      // REVERT TO PREVIOUS PAST STATE (IF ONE EXISTS)
      // args :
      //    itemToRestore (the object to restore to the desired state)
      //    func (the function to copy data from the desired state or follow required logic)
      restorePast : function(itemToRestore, func) {
         if (this.idx <= 0) {
            return;
         }

         this.idx--;
         func(itemToRestore, this.states[this.idx]);
      },
      // REVERT TO NEXT FUTURE STATE (IF ONE EXISTS)
      // args :
      //    itemToRestore (the object to restore to the desired state)
      //    func (the function to copy data from the desired state or follow required logic)
      restoreFuture : function(itemToRestore, func) {
         if (this.idx == this.states.length - 1) {
            return;
         }
         this.idx++;
         func(itemToRestore, this.states[this.idx]);
      }
   }

   // CALL TO CONSTRUCT A HistoryQueue
   _hs.create = function() {
      return new HistoryQueue();
   };

   return _hs;
}());
