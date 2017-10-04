function() {
   // DEVELOPED BY KARL AND PAT

   // TODO UPDATE DEPTH WHEN NODE IS ADDED
   this.label = 'BST';

   let sketchCtx = this;

   function BinarySearchTree(sketchCtx) {
      this.sketchCtx = sketchCtx;

      this.root = null;

      this.depth = 0;

      // TODO : FIX UNDO / REDO, WILL REPLACE LEGACY VERSION LATER
      this.history = HistoryQueue.create();
      // TODO : REPLACE WITH WORKING HISTORY LATER
      this.historyStack = [];


      // LEGACY UNDO
      this.useOldHistory = true;

      this._mustInitializePositions = true;

      BinarySearchTree.Node = function(value, center) {
         this.value = value;
         this.left = null;
         this.right = null;
         this.center = (center == undefined) ? undefined : [center[0], center[1], 0];
         // MANAGE COLORS
         this.colorManager = new ColorManager();
      };

      let bst = this;


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

      this.operationMemory = {
         active : false,
         operation : null
      };
   }



   BinarySearchTree.prototype = {
      doPendingOperation : function() {
         if (!this.operationMemory.active) {
            return;
         }
         let status = this.operationMemory.operation();
         if (status.done) {
            this.operationMemory.active = false;
            this.operationMemory.operation = null;
            // TODO : MAKE RE-INITIALIZATION CLEANER,
            // ADDITIONAL CASES TO CONSIDER FOR IN-PROGRESS OPERATIONS
            this._mustInitializePositions = true;
         }
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
      // TODO
      calcTraversalPauseTime : function() {
         let size = this.size();
         if (size == 0) {
            return 0.1;
         }
         let ret = max((4.2 / size), 0.13);
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
          let self = this;
          if (!this.operationMemory.active) {
             this.operationMemory.operation = (function() {
                let op = self._inOrder(self.root);


                return function(args) { return op.next(args); };

             }());
             this.operationMemory.active = true;
          }
      },

      _inOrder : function*(node) {
          node.colorManager.enableColor(true).setColor("purple");
          for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
          if (node === null){
            return;
          }
          if (node.left !== null) {
            yield *this._inOrder(node.left);
          }
          node.colorManager.enableColor(true).setColor("green");
          for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
          if (node.right !== null) {
            yield *this._inOrder(node.right);
         }
      },

      preOrder : function() {
          let self = this;
          if (!this.operationMemory.active) {
             this.operationMemory.operation = (function() {
                let op = self._preOrder(self.root);

                return function(args) { return op.next(args); };

             }());
             this.operationMemory.active = true;
          }
      },

      _preOrder : function*(node) {
          node.colorManager.enableColor(true).setColor("purple");
          for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }

          if (node === null) {
            return;
          }

          node.colorManager.enableColor(true).setColor("green");
          for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }

          if (node.left !== null) {
            yield *this._preOrder(node.left);
          }

          if (node.right !== null){
            yield *this._preOrder(node.right);
          }
      },


      postOrder : function() {
          let self = this;
          if (!this.operationMemory.active) {
             this.operationMemory.operation = (function() {
                let op = self._postOrder(self.root, self.calcTraversalPauseTime());

                return function(args) { return op.next(args); };

             }());
             this.operationMemory.active = true;
          }
      },

      _postOrder: function*(node, pauseTime) {
          node.colorManager.enableColor(true).setColor("purple");
          for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }
          if (node === null) {
            return;
          }

          if (node.left !== null){
            yield *this._postOrder(node.left, pauseTime);
          }

          if (node.right !== null){
            yield *this._postOrder(node.right, pauseTime);
          }

          node.colorManager.enableColor(true).setColor("green");
          for (let p = SketchAnimation.pause(pauseTime, this.sketchCtx); p();) { yield; }

      },

      remove : function(value) {
         let self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               let op = self._remove(value, self.root, null);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },

      _remove : function*(value, root, parent=null) {
         if (root == null) {
            return;
         }
//////////////////////////////
         let current = root;
         let comp = null;

         while (current !== null) {
            comp = current.value;
            if (value == comp) {
               current.colorManager.enableColor(true).setColor("orange");
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("red");
               }, current.right);
               break;
            }
            current.colorManager.enableColor(true).setColor("purple");
            parent = current;
            if (value < comp) {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("red");
               }, current.right);

               current = current.left;
            }
            else {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("red");
               }, current.left);

               current = current.right;
            }

            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; } // POTENTIAL EFFICIENCY ISSUES?
         }

         // NODE TO REMOVE DOES NOT EXIST,ABORT
         // (NO WAY TO SPECIFY NON-EXISTING NODE YET : TODO)
         if (value != comp) {
            return;
         }

         // CASES 1 AND 2: 1 CHILD,
         if (parent == null) {
            // SENTINEL
            parent = new BinarySearchTree.Node(-1);
         }
         if (parent.left == current) {
            if (current.left === null) {
               ///////// VERBOSE WAY
               {
                  let pause = SketchAnimation.create(
                     SketchAnimation.Type.NONE(),
                     .6,
                     true
                  );
                  while (!pause.step(this.sketchCtx.elapsed).finished) {
                     yield;
                  }
               }
               /////////
               current.colorManager.setColor("orange");

               parent.left = current.right;
               return;
            }
            else if (current.right === null) {
               ///////// SHORTENED WAY
               for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
               /////////
               current.colorManager.setColor("orange");
               parent.left = current.left;
               return;
            }
         }
         else if (parent.right == current) {
            if (current.left === null) {
               /////////
               for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
               /////////
               current.colorManager.setColor("orange");
               parent.right = current.right;
               return;
            }
            else if (current.right === null) {
               /////////
               for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
               /////////
               current.colorManager.setColor("orange");
               parent.right = current.left;
               return;
            }
         }
         else if (current.left == null && current.right == null) {
            /////////
            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
            /////////
            current.colorManager.setColor("orange");
            this.root = null;
            return;
         }

         // CASE 3 : FIND A PREDECESSOR

         // NAVIGATE BRANCH TO FIND PREDECESSOR
         let find = current.left;
         let copyVal = 0;

         ////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         find.colorManager.enableColor(true).setColor("cyan");

         /////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         this.applyAll(function(node) {
            node.colorManager.enableColor(true).setColor("red");
         }, find.left);

         while (find.right !== null) {
            find = find.right;
            find.colorManager.enableColor(true).setColor("cyan");
            this.applyAll(function(node) {
               node.colorManager.enableColor(true).setColor("red");
            }, find.left);

            if (find.right == null) {
               break;
            }
            /////////
            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
            /////////
         }

         find.colorManager.enableColor(true).setColor("orange");

         /////////
         for (let p = SketchAnimation.pause(.3, this.sketchCtx); p();) { yield; }
         /////////

         // MOVE THE COPY VALUE (VISUALLY)
         {
            let c1 = find.center;
            let c2 = current.center;
            let valMoveAni = SketchAnimation.create(
               SketchAnimation.Type.LINE({
                  start : { x : c1[0], y : c1[1] },
                  end : { x : c2[0], y : c2[1] }
               }),
               .6,
               true
            );
            let ret = {};
            while (!ret.finished) {
               ret = valMoveAni.step(this.sketchCtx.elapsed);
               textHeight(this.sketchCtx.mScale(.4));
               mText(find.value, ret.point, .5, .5, .5);
               yield;
            }
         }

         current.value = find.value;

         /////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         current.colorManager.enableColor(true).setColor("purple");

         /////////
         for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }
         /////////

         yield *this._remove(current.value, current.left, current);
      },

      insert : function(value) {
         // THIS WILL BE A COMMON PATTERN THAT I'LL TRY TO ABSTRACT AWAY LATER
         let self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               let op = self._insert(value);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },
      _insert : function*(value) {
         let toInsert = new BinarySearchTree.Node(value);
         toInsert.colorManager.enableColor(true).setColor("green");
         if (this.root === null) {
            this.root = toInsert;
            return;
         }

         let parent = null;
         let current = this.root;
         let comp = null;

         while (current !== null) {
            current.colorManager.enableColor(true).setColor("purple");
            parent = current;
            comp = current.value;
            if (value == comp) {
               return;
            }
            else if (value < comp) {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("red");
               }, current.right);

               current = current.left;
            }
            else {
               // HIGHLIGHT UN-TRAVERSED SUB-TREE
               this.applyAll(function(node) {
                  node.colorManager.enableColor(true).setColor("red");
               }, current.left);

               current = current.right;
            }

            for (let p = SketchAnimation.pause(.6, this.sketchCtx); p();) { yield; }

         }

         if (value < comp) {
            parent.left = toInsert;
         }
         else {
            parent.right = toInsert;
         }
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
         let newNode = new BinarySearchTree.Node(oldNode.value, oldNode.center);

         if (oldNode.left !== null){
            newNode.left = this.copyData(oldNode.left)
         }
         if (oldNode.right !== null){
            newNode.right = this.copyData(oldNode.right);
         }
         return newNode;
      },
      clone : function() {
         let newBST = new BinarySearchTree(this.sketchCtx);
         let oldNode = this.root;
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
         if (this.useOldHistory) {
            this.historyStack.push(this.clone());
            let newBST = this.historyStack[this.historyStack.length - 1];
            this.root = newBST.root;
            return;
         }

         // TODO
         // this.history.saveState(this.clone(), this.setState);
      },

      restorePast : function() {
         if (this.useOldHistory) {
            if (this.historyStack.length <= 1) {
               return;
            }
            let temp = this.historyStack.pop();
            let oldBST = this.historyStack[this.historyStack.length - 1];

            this.root = oldBST.root;
            this.depth = oldBST.depth;
         }

         // TODO
         // this.history.restorePast(this, this.setState);
      },

      restoreFuture : function() {
         // TODO
         // this.history.restoreFuture(this, this.setState);
      },

      _sortedArrayToBST : function(arr, start, end) {
         if (start > end){
            return null;
         }
         let mid = Math.trunc((start + end)/2);
         let node = new BinarySearchTree.Node(arr[mid]);
         node.left = this._sortedArrayToBST(arr, start, mid-1);
         node.right = this._sortedArrayToBST(arr, mid+1, end);
         return node;
      },

      createArrWithDepth : function(depth) {
         let height = depth - 1;
         let maxVal = pow(2, height + 1) - 1;
         let arr = [];
         for (let i = 1; i <= maxVal; i++){
            arr.push(i);
         }
         return arr;
      },

      createBSTWithDepth : function(value){
        this.depth = value;
        let arr = this.createArrWithDepth(value);

        return this._sortedArrayToBST(arr, 0, arr.length-1);;
      },

      print : function() {
         if (this.root === null) {
            return;
         }
         this.root.print();
      },
   };


   this.setup = function() {
      this.tree = new BinarySearchTree(this);
      this.tree.root = this.tree.createBSTWithDepth(3);
      this.tree.saveState();
   };

   // TODO, WILL SET NODE CENTERS ONLY WHEN DEPTH CHANGES
   // UNUSED
   this.initTreeLayout = function(node, center = [0, 0, 0], radius = 0.5, xOffset = 5, yOffset = 2, zOffset = 0) {
      if (node === null) {
         return;
      }

      function traverseTree(node, center, radius, parentCenter, parentRadius, xOffset = 5, yOffset = 2, zOffset = 0) {
         node.center = [center[0], center[1]];
         if (node.left !== null) {
            let newCenter = [center[0] - xOffset * radius,center[1] - yOffset * radius];
            traverseTree(node.left, newCenter, radius, center, radius, xOffset / 2);
         }
         if (node.right !== null) {
            let newCenter = [center[0] + xOffset * radius,center[1] - yOffset * radius];
            traverseTree(node.right, newCenter, radius, center, radius, xOffset / 2);
         }
      }

      let nodeSize = radius;
      let curNode = node;
      let depth = this.tree.depth;

      if (depth > 4){
         traverseTree(curNode, center, nodeSize, undefined, undefined, 20);
      }
      else if (depth > 3){
         traverseTree(curNode, center, nodeSize, undefined, undefined, 10);
      }
      else if (depth > 0) {
         traverseTree(curNode, center, nodeSize);
      }
   }

   this.drawNode = function(node, center, radius, parentCenter, parentRadius) {
     let left = center[0] - radius;
     let right = center[0] + radius;
     let bottom = center[1] - radius;
     let top = center[1] + radius;

     node.colorManager.activateColor();
     // DRAW CONTAINER
     mDrawOval([left, bottom], [right, top], 32, PI / 2 - TAU);
     node.colorManager.deactivateColor();

     // DRAW ELEMENT
     textHeight(this.mScale(.4));
     mText(node.value, center, .5, .5, .5);
   };

   // TODO : MOVE DRAW FUNCTIONS INTO THE STRUCTURE ITSELF?
   this._drawTree = function(node, center, radius, xOffset = 5, yOffset = 2) {
      if (node === null) {
         return;
      }

      function drawParentToChildEdge(center, radius, childCenter) {
         let childParentVec = [childCenter[0] - center[0], childCenter[1] - center[1]];
         let childParentDist = sqrt(pow(childParentVec[0], 2) + pow(childParentVec[1], 2));

         let edgeOfParent = [center[0] + radius / childParentDist * childParentVec[0], center[1] + radius / childParentDist * childParentVec[1]];
         let edgeOfChild = [childCenter[0] - radius / childParentDist * childParentVec[0], childCenter[1] - radius / childParentDist * childParentVec[1]];
         mLine(edgeOfParent, edgeOfChild);
      }

      if (this.tree.mustInitializePositions()) {
         node.center = center;
      }

      center = node.center;

      this.drawNode(node, center, radius);

      if (node.left !== null) {
         let newCenter = [center[0] - xOffset * radius, center[1] - yOffset * radius];
         drawParentToChildEdge(center, radius, newCenter);
         this._drawTree(node.left, newCenter, radius, xOffset / 2);
      }
      if (node.right !== null) {
         let newCenter = [center[0] + xOffset * radius, center[1] - yOffset * radius];
         drawParentToChildEdge(center, radius, newCenter);
         this._drawTree(node.right, newCenter, radius, xOffset / 2);
      }
   };

   this.drawTree = function(node, center, radius, xOffset = 5, yOffset = 2) {
      this._drawTree(node, center, radius, xOffset, yOffset);
      this.tree._mustInitializePositions = false;
   };

   // CHECK IF POINT LIES WITHIN CIRCLE
   this.inCircle = function(node, clickLocation){
      let dist = Math.sqrt((clickLocation[0] - node.center[0]) * (clickLocation[0] - node.center[0]) +
                          (clickLocation[1] - node.center[1]) * (clickLocation[1] - node.center[1]));
      return dist < 0.5;
   };

   this._findClickedNode = function(node, clickLocation) {
      if (!this.inCircle(node, clickLocation)) {
         if (node.center[0] > clickLocation[0]) {
            if (node.left !== null){
               return this.findClickedNode(node.left, clickLocation);
            }
            return null;
         }
         else {
            if (node.right !== null) {
               return this.findClickedNode(node.right, clickLocation);
            }
            return null;
         }
      }
      return node;
   };

   this.findClickedNode = function(node, clickLocation) {
      return (node === null) ?
               null : this._findClickedNode(node, clickLocation);
   };

   // STORE CLICK INFORMATION FROM PREVIOUS FRAMES
   this.clickInfoCache = {
      px : null,
      py : null,
      time : -1
   };


   this.onPress = function(p) {
      let ci = this.clickInfoCache;
      ci.x = p.x;
      ci.y = p.y;
      ci.time = time;


      this.tree.resetGraphicTemporaries();
   }

   this.onRelease = function(p) {
      let ci = this.clickInfoCache;
      if (abs(p.x - ci.x) < 0.05 &&
          abs(p.y - ci.y) < 0.05) {
         let node = this.findClickedNode(this.tree.root, [ci.x, ci.y]);
         if (node !== null) {
            this.tree.saveState();
            this.tree.remove(node.value);
         }
      }
      ci.x = null;
      ci.y = null;
   }

   this.onSwipe[0] = [
      'postorder traversal',
      function(){
        this.tree.postOrder();
      }
   ];

   this.onSwipe[4] = [
      'undo',
      function() {
         this.tree.restorePast();
      }
   ];

   // this.onSwipe[0] = [
   //    'redo',
   //    function() {
   //       this.tree.restoreFuture();
   //    }
   // ];


   this.onCmdClick = function(p) {
      console.log("cmd_click");
   };
   this.onCmdPress = function(p) {
      console.log("cmd_press");
   };
   this.onCmdDrag = function(p) {
      console.log("cmd_drag");
   };
   this.onCmdRelease = function(p) {
      console.log("cmd_release");
   };

   this.onDrag = function(p) {
      let ci = this.clickInfoCache;
      // save a point "boundary"/"threshold" for comparison
      let point = [p.x, p.y];

      let addedDepth = Math.round((ci.y - point[1]) / 2);
      if (addedDepth !== 0) {
         let newDepth = this.tree.depth + addedDepth;
         newDepth = min(newDepth, 6);
         newDepth = max(newDepth, 0);
         this.tree.root = this.tree.createBSTWithDepth(newDepth);
         this.tree._mustInitializePositions = true;
         if (!(this.tree.depth === 0 && newDepth === 0)) {
            this.tree.saveState();
         }
         this.tree.depth = newDepth;


         ci.y = point[1];
      };
   };

   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      let out = other.output();
      out = Number(1 * out);

      this.tree.saveState();
      this.tree.insert(out);

      other.fade();
      other.delete();

   };

   this.drawEmpty = function(center, radius) {
      let left = center[0] - radius;
      let right = center[0] + radius;
      let bottom = center[1] - radius;
      let top = center[1] + radius;
      color("grey");
      mDrawOval([left, bottom], [right, top], 32, PI / 2 - TAU);

      color("blue");
      textHeight(this.mScale(.2));
      mText("nullptr", center, .5, .5, .5);
   };

   // THE ELAPSED TIME MUST BE AVAILABLE AT ALL TIMES, HOW TO ENFORCE?
   sketchCtx.elapsed = 0.0;
   this.render = function(elapsed) {
      sketchCtx.elapsed = elapsed;
      this.duringSketch(function(){
         mDrawOval([-1,-1], [1,1], 32, PI, 0);
      });
      this.afterSketch(function() {
         let nodeSize = 0.5;
         let center = [0, 0];

         let curNode = this.tree.root;
         let depth = this.tree.depth;

         if (depth > 4) {
            this.drawTree(curNode, center, nodeSize, 20);
         }
         else if (depth > 3) {
            this.drawTree(curNode, center, nodeSize, 10);
         }
         else if (depth > 0) {
            this.drawTree(curNode, center, nodeSize);
         }
         else {
            this.drawEmpty(center, nodeSize);
         }

         this.tree.doPendingOperation();
      });
   }
}
