function() {
  // TODO update depth when node is added.
   this.label = 'BST';

   let sketchCtx = this;
   this.stack = [];

   function BST() {
      this.root = null;

      this.depth = 0;

      // TODO : fix UNDO / REDO, WILL REPLACE LEGACY VERSION LATER
      this.history = HistoryQueue.create();


      // LEGACY UNDO
      this.useOldHistory = true;

      BST.Node = function(value, center) {
         this.value = value;
         this.left = null;
         this.right = null;
         this.center = (center == undefined) ? undefined : [center[0], center[1]];
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

      this.applyAll = function(func) {
         if (this.root == null) {
            return;
         }
         this._applyAll(func, this.root);
      };

      this.resetGraphicTemporaries = function() {
         this.applyAll(function(node) {
            // RESET COLORS
            node.colorManager.colorEnabled(false);
         });
      };

      BST.Node.prototype = {
         getPredecessor : function(node) {
            let curNode = node.left;
            while (curNode.right !== null){
               curNode = curNode.right;
            }
            return curNode.value;
         },


         remove : function(node) {
            if (node.left === null){
               return node.right;
            }
            if (node.right === null){
               return node.left;
            }
            let value = this.getPredecessor(node);
            node.value = value;
            node.left = this.recursiveRemove(node.left, value);
            return node;
         },

         recursiveRemove: function(node, value) {
            if (value < node.value){
               node.left = this.recursiveRemove(node.left, value);
            }
            else if (value > node.value){
               node.right = this.recursiveRemove(node.right, value);
            }
            else {
               node = this.remove(node);
            }
            return node;
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

      this.operationMemory = {
         active : false,
         operation : null
      };
   }



   BST.prototype = {
      doPendingOperations : function() {
         if (!this.operationMemory.active) {
            return;
         }
         let status = this.operationMemory.operation();
         if (status.done) {
            this.operationMemory.active = false;
            this.operationMemory.operation = null;
         }       
      },

      doPendingDraws : function() {
         // TODO
      },

      insert : function(value) {
         // THIS WILL BE A COMMON PATTERN THAT I'LL TRY TO ABSTRACT AWAY LATER
         let self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() { 
               let op = self._insert(value);

               return function(arg) { return op.next() };

            }());
            this.operationMemory.active = true;
            this.doPendingOperations();
         }
         // else {
         //    let status = this.operationMemory.operation();
         //    if (status.done) {
         //       this.operationMemory.active = false;
         //       this.operationMemory.operation = null;
         //    }
         // }
      },
      _insert : function*(value) {
         if (this.root === null) {
            this.root = new BST.Node(value);
            this.root.colorManager.colorEnabled(true).setColor("green");
            return;
         }

         let toInsert = new BST.Node(value);
         toInsert.colorManager.colorEnabled(true).setColor("green");
         let parent = null;
         let current = this.root;
         let comp = null;

         while (current !== null) {
            current.colorManager.colorEnabled(true).setColor("purple");
            parent = current;
            comp = current.value;
            if (value == comp) {
               return;
            }
            else if (value < comp) {
               current = current.left;
            }
            else {
               current = current.right;
            }

            // TESTING PAUSE (WILL BE MORE INTERESTING LATER ONCE THE EDGES ARE MADE AS OBJECTS THAT CAN BE CONFIGURED EASILY)
            let pause = SketchAnimation.create(
               SketchAnimation.Type.NONE(),
               .2,
               true
            );
            while (!pause.step(sketchCtx.elapsed).finished) {
               yield;
            }
         }

         if (value < comp) {
            parent.left = toInsert;
         }
         else {
            parent.right = toInsert;
         }
      },

      remove : function(value){
         this.root = this.root.recursiveRemove(this.root, value);
      },
      copyData: function(oldNode) {
         let newNode = new BST.Node(oldNode.value, oldNode.center);

         if (oldNode.left !== null){
            newNode.left = this.copyData(oldNode.left)
         }
         if (oldNode.right !== null){
            newNode.right = this.copyData(oldNode.right);
         }
         return newNode;
      },
      clone : function() {
         let newBST = new BST();
         let oldNode = this.root;
         if (this.root === null) {
            return newBST;
         }

         newBST.root = new BST.Node(oldNode.value, oldNode.center);
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
            sketchCtx.stack.push(this.clone());
            let newBST = sketchCtx.stack[sketchCtx.stack.length - 1];
            this.root = newBST.root;
            return;
         }

         // TODO
         // this.history.saveState(this.clone(), this.setState);
      },

      restorePast : function() {
         if (this.useOldHistory) {
            if (sketchCtx.stack.length <= 1) {
               return;
            }
            let temp = sketchCtx.stack.pop();
            let oldBST = sketchCtx.stack[sketchCtx.stack.length - 1];

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
         let node = new BST.Node(arr[mid]);
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
      this.tree = new BST();
      this.tree.root = this.tree.createBSTWithDepth(3);
      this.tree.saveState();
   };

   // NOT USED RIGHT NOW
   this.getSize = function(node) {
      if (node === null) {
         return 0;
      }
      return this.getSize(node.left) + 1 + this.getSize(node.right);
   };


   // TODO, WILL SET NODE CENTERS ONLY WHEN DEPTH CHANGES
   this.initTreeLayout = function(node, center = [0, 0], radius = 0.5, xOffset = 5, yOffset = 2) {
      if (node === null) {
         return;
      }

      function traverseTree(node, center, radius, parentCenter, parentRadius, xOffset = 5, yOffset = 2) {
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

   this.drawTree = function(node, center, radius, xOffset = 5, yOffset = 2){
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

      if (node.center === undefined) {
         node.center = center;
      }

      this.drawNode(node, center, radius);
      if (node.left !== null) {
         let newCenter = [center[0] - xOffset * radius, center[1] - yOffset * radius];
         drawParentToChildEdge(center, radius, newCenter);
         this.drawTree(node.left, newCenter, radius, xOffset / 2);
      }
      if (node.right !== null) {
         let newCenter = [center[0] + xOffset * radius, center[1] - yOffset * radius];
         drawParentToChildEdge(center, radius, newCenter);
         this.drawTree(node.right, newCenter, radius, xOffset / 2);
      }
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


   this.onSwipe[4] = [
      'undo',
      function() {
         this.tree.restorePast();
      }
   ];

   this.onSwipe[0] = [
      'redo',
      function() {
         this.tree.restoreFuture();
      }
   ];

     
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
         if (!(this.tree.depth === 0 && newDepth === 0)) {
            this.tree.saveState();
         }
         this.tree.depth = newDepth;


         ci.y = point[1];
      };


      // if (newDepth > 1){

      // }
      // else if (newDepth < 0) {
      //
      // }

   };

   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      let out = other.output();
       //if (/^\d+$/.test(out)){
      out = Number(1 * out);

      this.tree.saveState();
      this.tree.insert(out);

      other.fade();
      other.delete();
       //}

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

   sketchCtx.elapsed = 0.0;
   this.render = function(elapsed) {
      sketchCtx.elapsed = elapsed;
      this.duringSketch(function(){
        mDrawOval([-1,-1], [1,1], 32, PI, 0);
        // mLine([-1, 0], [1, 0]);
      });
      this.afterSketch(function() {
         // this.drawNode([0,0],.5);
         // this.drawNode([-1,-1],.5, [0,0],.5);
         // this.drawNode([ 1,-1],.5, [0,0],.5);
         let nodeSize = 0.5;
         let center = [0,0];

         let curNode = this.tree.root;
         let depth = this.tree.depth;

         if (depth > 4){
            this.drawTree(curNode, center, nodeSize, 20);
         }
         else if (depth > 3){
            this.drawTree(curNode, center, nodeSize, 10);
         }
         else if (depth > 0) {
            this.drawTree(curNode, center, nodeSize);
         }
         else {
            this.drawEmpty(center, nodeSize);
         }

         this.tree.doPendingOperations();
      });
   }
}