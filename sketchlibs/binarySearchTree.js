"use strict";

function BinarySearchTree(sketchCtx) {
   this.sketchCtx = sketchCtx;

   this.root = null;

   this.depth = 0;

   // TODO : FIX UNDO / REDO, WILL REPLACE LEGACY VERSION LATER
   //this.history = HistoryQueue.create();
   // TODO : REPLACE WITH WORKING BACKWARDS AND FUTURE HISTORY LATER
   this.historyStack = [];


   // Keeps track of all operations for output
   this.operationStack = [];

   // LEGACY UNDO
   this.useOldHistory = true;

   this._mustInitializePositions = true;

   this.depthCounts = {};

   // TODO : IMPLEMENT SKETCH CONTROLS TO ENABLE / DISABLE
   this.blocker = new BreakpointManager();
   // this.blocker.enableBreakpoints(true);

   BinarySearchTree.Node = function(value, center) {
      this.value = value;
      this.left = null;
      this.right = null;
      this.center = (center == undefined) ? undefined : [center[0], center[1], 0];
      this.colorManager = new ColorManager();
   };

   this._applyAll = function(func, node) {
      func(node);
      if (node.left !== null) {
         this._applyAll(func, node.left);
      }
      if (node.right !== null) {
         this._applyAll(func, node.right);
      }
   };

   this.applyAll = function(func, node) {
      node = (node === undefined) ? this.root : node;
      if (node == null) {
         return;
      }
      this._applyAll(func, node);
   };

   this.resetGraphicTemporaries = function() {
      this.applyAll(function(node) {
         // RESET COLORS
         node.colorManager.enableColor(false);
      });
   };

   BinarySearchTree.Node.prototype = {
      get children() {
         const _children = [];
         if (this.left != null) {
            _children.push(this.left);
         }
         if (this.right != null) {
            _children.push(this.right);
         }
         return _children;
      },

      toString : function() {
         return "(" + this.value + ")";
      },

      print : function() {
         if (this.left !== null) {
            this.left.print();
         }
         console.log(this.toString());
         if (this.right !== null) {
            this.right.print();
         }
      }
   };
}



BinarySearchTree.prototype = {
   operationMemory : {
      active : false,
      operation : null
   },
   isAcceptingInput : true,
   doPendingOperation : function() {
      if (!this.operationMemory.active) {
         this.isAcceptingInput = true;
         return;
      }
      if (this.blocker.isBlocked()) {
         return;
      }
      const status = this.operationMemory.operation();
      if (status.done) {
         this.operationMemory.active = false;
         this.operationMemory.operation = null;
         // TODO : MAKE RE-INITIALIZATION CLEANER,
         // ADDITIONAL CASES TO CONSIDER FOR IN-PROGRESS OPERATIONS
         this._mustInitializePositions = true;
         this.isAcceptingInput = true;

         // TODO this.blocker.
         return;
      }
      this.isAcceptingInput = false;
      return;
   },
   hasPendingOperation : function() {
      return this.operationMemory.active;
   },

   doPendingDraws : function() {
      // TODO
   },

   mustInitializePositions : function() {
      return this._mustInitializePositions;
   },
   // TODO IMPROVE
   calcTraversalPauseTime : function() {
      const size = this.size();
      if (size == 0) {
         return 0.1;
      }
      const ret = max((4.2 / size), 0.13);
      return ret;
   },

   getSize: function(){
     return this._getSize(this.root);
   },

   _getSize : function(node) {
      if (node === null) {
         return 0;
      }
      return this._getSize(node.left) + 1 + this._getSize(node.right);
   },

   inOrder : function() {
      const self = this;
      if (!this.operationMemory.active) {
         this.operationMemory.operation = (function() {
            const op = self._inOrder(self.root, self.calcTraversalPauseTime());

            return function(args) { return op.next(args); };

         }());
         this.operationMemory.active = true;
      }
   },

   _inOrder : function*(node, pauseTime) {
      node.colorManager.enableColor(true).setColor("purple");
      for (let p = SketchLerp.pause(pauseTime, this.sketchCtx); p();) { yield; }
      if (node === null){
         return;
      }
      if (node.left !== null) {
         yield *this._inOrder(node.left, pauseTime);
      }
      node.colorManager.enableColor(true).setColor("green");
      for (let p = SketchLerp.pause(pauseTime, this.sketchCtx); p();) { yield; }
      if (node.right !== null) {
         yield *this._inOrder(node.right, pauseTime);
      }
   },

   preOrder : function() {
      const self = this;
      if (!this.operationMemory.active) {
         this.operationMemory.operation = (function() {
            const op = self._preOrder(self.root, self.calcTraversalPauseTime());

            return function(args) { return op.next(args); };

         }());
         this.operationMemory.active = true;
      }
   },

   _preOrder : function*(node, pauseTime) {
      node.colorManager.enableColor(true).setColor("purple");
      for (let p = SketchLerp.pause(pauseTime, this.sketchCtx); p();) { yield; }

      if (node === null) {
         return;
      }

      node.colorManager.enableColor(true).setColor("green");
      for (let p = SketchLerp.pause(pauseTime, this.sketchCtx); p();) { yield; }

      if (node.left !== null) {
         yield *this._preOrder(node.left, pauseTime);
      }

      if (node.right !== null){
         yield *this._preOrder(node.right, pauseTime);
      }
   },


   postOrder : function() {
      const self = this;
      if (!this.operationMemory.active) {
         this.operationMemory.operation = (function() {
            const op = self._postOrder(self.root, self.calcTraversalPauseTime());

            return function(args) { return op.next(args); };

         }());
         this.operationMemory.active = true;
      }
   },

   _postOrder: function*(node, pauseTime) {
      node.colorManager.enableColor(true).setColor("purple");
      for (let p = SketchLerp.pause(pauseTime, this.sketchCtx); p();) { yield; }
      if (node === null) {
         return;
      }

      if (node.left !== null) {
         yield *this._postOrder(node.left, pauseTime);
      }

      if (node.right !== null) {
         yield *this._postOrder(node.right, pauseTime);
      }

      node.colorManager.enableColor(true).setColor("green");
      for (let p = SketchLerp.pause(pauseTime, this.sketchCtx); p();) { yield; }

   },

   breadthFirst : function() {
      const self = this;
      if (!this.operationMemory.active) {
         this.operationMemory.operation = (function() {
            const op = self._breadthFirst(self.calcTraversalPauseTime());

            return function(args) { return op.next(args); };

         }());
         this.operationMemory.active = true;
      }
   },

   _breadthFirst : function*(pauseDuration) {
      if (this.root === null) {
         return;
      }

      const pauseDequeue = SketchLerp.pauseAutoReset(pauseDuration);
      const pauseEnqueue = SketchLerp.pauseAutoReset(pauseDuration);

      const queue = [];
      let parent = this.root;

      parent.colorManager.enableColor(true).setColor("yellow");
      queue.push(parent);
      while (pauseEnqueue()) { yield; }
      
      while (queue.length > 0) {
         parent = queue.shift();
         parent.colorManager.enableColor(true).setColor("green");
         while (pauseDequeue()) { yield; }

         for (const child of parent.children) {
            child.colorManager.enableColor(true).setColor("yellow");
            queue.push(child);
            while (pauseEnqueue()) { yield; }
         }
      }
   },

   remove : function(value) {
      this.operationStack.push("remove(" + value + ")");
      const self = this;
      if (!this.operationMemory.active) {
         this.operationMemory.operation = (function() {
            const op = self._remove(value, self.root, null);

            return function(args) { return op.next(args); };

         }());
         this.operationMemory.active = true;
      }
   },

   _remove : function*(value, root, parent = null) {
      if (root == null) {
         return;
      }
      let current = root;
      let comp = null;

      let _depth = 0;

      const movementPause = SketchLerp.pauseAutoReset(0.6);

      while (current !== null) {
         _depth++;
         comp = current.value;
         if (value == comp) {
            current.colorManager.enableColor(true).setColor("orange");
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("grey");
            }, current.right);
            break;
         }
         current.colorManager.enableColor(true).setColor("purple");
         parent = current;
         if (value < comp) {
            // HIGHLIGHT UN-TRAVERSED SUB-TREE
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("grey");
            }, current.right);

            current = current.left;
         }
         else {
            // HIGHLIGHT UN-TRAVERSED SUB-TREE
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("grey");
            }, current.left);

            current = current.right;
         }

         while (movementPause()) { yield; }
      }

      // NODE TO REMOVE DOES NOT EXIST,ABORT
      // (NO WAY TO SPECIFY NON-EXISTING NODE YET : TODO)
      if (value != comp) {
         return;
      }

      let hasTwoChildren = false;
      // CASES 1 AND 2: 1 CHILD
      if (parent == null) {
         // SENTINEL
         parent = new BinarySearchTree.Node(-1);
      }
      if (parent.left == current) {
         if (current.left === null) {
            while (movementPause()) { yield; }

            current.colorManager.setColor("orange");

            parent.left = current.right;
         }
         else if (current.right === null) {
            while (movementPause()) { yield; }

            current.colorManager.setColor("orange");
            parent.left = current.left;
         }
         else {
            hasTwoChildren = true;
         }
      }
      else if (parent.right == current) {
         if (current.left === null) {
            while (movementPause()) { yield; }

            current.colorManager.setColor("orange");
            parent.right = current.right;
         }
         else if (current.right === null) {
            while (movementPause()) { yield; }

            current.colorManager.setColor("orange");
            parent.right = current.left;
         }
         else {
            hasTwoChildren = true;
         }
      }
      else if (current.left == null && current.right == null) {
         while (movementPause()) { yield; }

         current.colorManager.setColor("orange");
         this.root = null;
      }
      else {
         hasTwoChildren = true;
      }

      if (!hasTwoChildren) {
         // CHECK WHETHER MAXIMUM DEPTH HAS DECREASED
         this.depthCounts[_depth]--;
         if (this.depthCounts[_depth] == 0 && this.depth == _depth) {
            this.depth = _depth - 1;
            // STRETCH THE TREE INWARDS
            const stretch = this._stretchPositions(this.root, 0.6);
            while (!stretch.next().done) {
               yield;
            }
         }
         return;
      }

      
      this.blocker.block();

      // CASE 3 : FIND A PREDECESSOR

      // NAVIGATE BRANCH TO FIND PREDECESSOR
      let find = current.left;
      _depth++;
      let copyVal = 0;

      while (movementPause()) { yield; }

      find.colorManager.enableColor(true).setColor("cyan");

      while (movementPause()) { yield; }


      this.applyAll(function(node) {
         node.colorManager.enableColor(true).setColor("grey");
      }, find.left);

      while (find.right !== null) {
         _depth++;

         find = find.right;
         find.colorManager.enableColor(true).setColor("cyan");
         this.applyAll(function(node) {
            node.colorManager.enableColor(true).setColor("grey");
         }, find.left);

         if (find.right == null) {
            break;
         }
         
         while (movementPause()) { yield; }
      }

      find.colorManager.enableColor(true).setColor("orange");

      while (movementPause()) { yield; }

      this.blocker.block();

      // MOVE THE COPY VALUE (VISUALLY)
      {
         let c1 = find.center;
         let c2 = current.center;
         let valMoveAni = SketchLerp.create(
            SketchLerp.Type.LINE({
               start : { x : c1[0], y : c1[1] },
               end : { x : c2[0], y : c2[1] }
            }),
            .6,
            true
         );
         let ret = {};
         while (!ret.done) {
            ret = valMoveAni.step();
            textHeight(this.sketchCtx.mScale(.4));
            mText(find.value, ret.point, .5, .5, .5);
            yield;
         }
      }

      current.value = find.value;

      while (movementPause()) { yield; }

      current.colorManager.enableColor(true).setColor("purple");

      while (movementPause()) { yield; }

      yield *this._remove(current.value, current.left, current);

      // CHECK WHETHER MAXIMUM DEPTH HAS DECREASED
      this.depthCounts[_depth]--;
      if (this.depthCounts[_depth] == 0 && this.depth == _depth) {
         this.depth = _depth - 1;
         // STRETCH THE TREE INWARDS
         const stretch = this._stretchPositions(this.root, 0.6);
         while (!stretch.next().done) {
            yield;
         }
      }
   },

   insert : function(value) {
      this.operationStack.push("insert(" + value + ")");
      // THIS WILL BE A COMMON PATTERN THAT I'LL TRY TO ABSTRACT AWAY LATER
      const self = this;
      if (!this.operationMemory.active) {
         this.operationMemory.operation = (function() {
            const op = self._insert(value);

            return function(args) { return op.next(args); };

         }());
         this.operationMemory.active = true;
      }
   },
   _insert : function*(value) {
      const toInsert = new BinarySearchTree.Node(value);
      toInsert.colorManager.enableColor(true).setColor("green");
      if (this.root === null) {
         this.root = toInsert;
         this.depth = 1;
         this.depthCounts[0] = 1;
         return;
      }

      let parent = null;
      let current = this.root;
      let comp = null;

      let _depth = 1;

      while (current !== null) {
         _depth++;
         current.colorManager.enableColor(true).setColor("purple");
         parent = current;
         comp = current.value;
         if (value == comp) {
            return;
         }
         else if (value < comp) {
            // HIGHLIGHT UN-TRAVERSED SUB-TREE
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("grey");
            }, current.right);

            current = current.left;
         }
         else {
            // HIGHLIGHT UN-TRAVERSED SUB-TREE
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("grey");
            }, current.left);

            current = current.right;
         }

         for (let p = SketchLerp.pause(.6, this.sketchCtx); p();) { yield; }

      }

      if (value < comp) {
         parent.left = toInsert;
      }
      else {
         parent.right = toInsert;
      }

      // TODO : DO NOT STRETCH AT ALL DEPTHS, POSSIBLY DO STRETCH AT DIFFERENT TIME
      this.depthCounts[_depth] = (this.depthCounts[_depth] !== undefined) ? this.depthCounts[_depth] + 1 : 1;
      if (this.depth < _depth) {
         this.depth = _depth;
      }
      else {
         return;
      }

      // STRETCH THE TREE OUTWARDS
      const stretch = this._stretchPositions(this.root, 0.6);
      while (!stretch.next().done) {
         yield;
      }
   },

   _stretchPositions : function*(root, duration) {
      // CREATE AN ARRAY OF THE ORIGINAL NODE POSITIONS
      function getOriginalPositions(root, arr, nodeArr) {
         if (root == null || root.center == undefined) {
            return;
         }
         arr.push(root.center);
         nodeArr.push(root);
         
         getOriginalPositions(root.left, arr, nodeArr);
         getOriginalPositions(root.right, arr, nodeArr);
      }
      // TRAVERSE THE TREE AND CALCULATE THE NEW NODE POSITIONS
      // WITHOUT MUTATING THE TREE,
      // RETURN AN ARRAY OF THESE NEW POSITIONS
      // (SAME ORDER AS IN getOriginalPositions())
      let that = this.sketchCtx;
      function getNewPositions(root, arr) {
         that._predictTreeLayout(root, arr);
      }

      const starts = [];
      const nodes = [];
      const ends = [];
      
      // GET CURRENT NODE POSITIONS AND POINTERS TO NODES
      getOriginalPositions(root, starts, nodes);
      // CALCULATE NEW NODE POSITIONS FOR STRETCHED TREE
      getNewPositions(root, ends);

      // CREATE LINEAR INTERPOLATION OBJECTS FOR EACH NODE'S
      // MOVEMENT TOWARDS THEIR NEW POSITIONS
      const transitions = [];
      for (let t = 0; t < starts.length; t++) {
         transitions.push(
            SketchLerp.create(
               SketchLerp.Type.LINE({
                  start : {x : starts[t][0], y : starts[t][1]},
                  end : {x : ends[t][0], y : ends[t][1]}
               }),
               duration,
            )
         );
      }

      // MOVE THE NODES UNTIL THEY REACH THEIR END POSITIONS
      let done = true;
      let status = null;
      do {
         done = true;
         for (let t = 0; t < transitions.length; t++) {
            status = transitions[t].step();
            nodes[t].center = status.point;
            done &= status.done;
         }  
         yield;             
      } while (!done);
   },

   size : function(node) {
      if (node === undefined) {
         node = this.root;
      }
      return this._size(this.root);
   },

   _size : function(node) {
      if (node === null) {
         return 0;
      }
      return this._size(node.left) + 1 + this._size(node.right);
   },

   copyData : function(oldNode) {
      const newNode = new BinarySearchTree.Node(oldNode.value, oldNode.center);

      if (oldNode.left !== null){
         newNode.left = this.copyData(oldNode.left)
      }
      if (oldNode.right !== null){
         newNode.right = this.copyData(oldNode.right);
      }
      return newNode;
   },
   clone : function() {
      const newBST = new BinarySearchTree(this.sketchCtx);
      const oldNode = this.root;
      if (this.root === null) {
         return newBST;
      }

      newBST.root = new BinarySearchTree.Node(oldNode.value, oldNode.center);
      newBST.depth = this.depth;
      if (oldNode.left !== null) {
         newBST.root.left = this.copyData(oldNode.left);
      }
      if (oldNode.right !== null) {
         newBST.root.right = this.copyData(oldNode.right);
      }

      return newBST;

   },

   setState : function(now, past) {
      now.root = past.root;
      now.depth = past.depth;
   },

   saveState : function() {
      if (!this.isAcceptingInput) {
         return;
      }

      if (this.useOldHistory) {
         this.historyStack.push(this.clone());
         const newBST = this.historyStack[this.historyStack.length - 1];
         this.root = newBST.root;
         return;
      }

      // TODO
      // this.history.saveState(this.clone(), this.setState);
   },

   restorePast : function() {
      if (!this.isAcceptingInput) {
         return;
      }

      if (this.useOldHistory) {
         if (this.historyStack.length <= 1) {
            return;
         }
         const temp = this.historyStack.pop();
         const oldBST = this.historyStack[this.historyStack.length - 1];

         this.root = oldBST.root;
         this.depth = oldBST.depth;
      }

      // TODO
      // this.history.restorePast(this, this.setState);
   },

   restoreFuture : function() {
      if (!this.isAcceptingInput) {
         return;
      }
      // TODO
      // this.history.restoreFuture(this, this.setState);
   },

   _sortedArrayToBST : function(arr, start, end) {
      if (start > end){
         return null;
      }
      const mid = Math.trunc((start + end) / 2);
      const node = new BinarySearchTree.Node(arr[mid]);
      this.operationStack.push("insert(" + arr[mid] + ")");
      node.left = this._sortedArrayToBST(arr, start, mid - 1);
      node.right = this._sortedArrayToBST(arr, mid + 1, end);
      return node;
   },

   createArrWithDepth : function(depth) {
      const height = depth - 1;
      const maxVal = pow(2, height + 1) - 1;
      const arr = [];
      for (let i = 1; i <= maxVal; i++) {
         arr.push(i);
      }
      return arr;
   },

   createBSTWithDepth : function(value) {
      this.depth = value;
      // TODO MAKE MORE EFFICIENT WITH PRE-CALCULATION
      const arr = this.createArrWithDepth(value);
      let count = 1;
      this.depthCounts = {};
      for (let i = 1; i <= value; i++) {
         this.depthCounts[i] = count;
         count *= 2;
      }
      return this._sortedArrayToBST(arr, 0, arr.length - 1);
   },

   print : function() {
      if (this.root === null) {
         return;
      }
      this.root.print();
   },
};
