function() {
   this.label = 'Graph';

   function Graph(sketchCtx){
      this.sketchCtx = sketchCtx;
      this.state = 0; // controls the state of the graph
      this.adjList = {};
      this.counter = 1;
      this.nodeMap = {};
      this.edgeMap = {};
      this.posToKey = {}; // maps node center to its key
      // for example 0,2 => 2, where (0,2) is a string

      // Keeps track of all operations for output
      this.operationStack = [];

      this.blocker = new BreakpointManager();


      Graph.Node = function(value, center) {
         this.value = value;
         this.center = (center == undefined) ? undefined : [center[0], center[1], 0];
         this.colorManager = new ColorManager();
      };

   }

   Graph.prototype = {
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
      resetAllColors: function() {
         let allNodes = this.nodeMap;
         let nodeKeys = Object.keys(allNodes);
         for (var i=0;i<nodeKeys.length;i++){
            allNodes[nodeKeys[i]].colorManager.enableColor(false);
         }
      },
      breadthFirst : function(node) {
         const self = this;
         if (!this.operationMemory.active) {
            console.log("!")
            this.operationMemory.operation = (function() {
               console.log(node)
               const op = self._breadthFirst(.5,node);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },



      _breadthFirst : function*(pauseDuration, node) {
         let visitedNodes = [];
         if (node === undefined) {
            return;
         }

         const pauseDequeue = LerpUtil.pauseAutoReset(pauseDuration);
         const pauseEnqueue = LerpUtil.pauseAutoReset(pauseDuration);

         const queue = [];
         let opQueue = [];
         let curNode = node;

         curNode.colorManager.enableColor(true).setColor("yellow");
         visitedNodes.push(curNode.value);
         queue.push(curNode);
         opQueue.push(curNode.value);

         this.operationStack = opQueue;
         while (pauseEnqueue()) { yield; }


         while (queue.length > 0) {
            curNode = queue.shift();
            opQueue.shift();
            curNode.colorManager.enableColor(true).setColor("green");
            while (pauseDequeue()) { yield; }

            let connectedNodes = this.edgeMap[curNode.value]; // cus value = key (to be changed)
            for (const child of connectedNodes) {
               let oldColor = child.colorManager.color;
               if (visitedNodes.indexOf(child.value) < 0){ // if it hasnt been visited
                  child.colorManager.enableColor(true).setColor("yellow");
                  queue.push(child);
                  opQueue.push(child.value);
                  visitedNodes.push(child.value);
               } else {
                  // child.colorManager.enableColor(true).setColor("orange");
               }
               while (pauseEnqueue()) { yield; }
               if ((oldColor === "yellow"||oldColor==="green") && child.colorManager.color === "orange"){
                  child.colorManager.enableColor(true).setColor(oldColor);
               }
            }
         }
         visitedNodes = [];
         this.resetAllColors();

      },

   }

   this.drawGrid = function(){
      let left = -7;
      let right = 7;
      let bottom = -7;
      let top = 7;
      for (var i=left;i<=right;i++){
         mLine([i,top],[i,bottom]);
      }
      for (var i=bottom;i<=top;i++){
         mLine([left,i],[right,i]);
      }

   };

   this.drawNode = function(node, value, center){
      let radius = 0.5;
      const left = center[0] - radius;
      const right = center[0] + radius;
      const bottom = center[1] - radius;
      const top = center[1] + radius;
      node.colorManager.activateColor();
      mDrawOval([left, bottom], [right, top], 32, PI / 2 - TAU);
      node.colorManager.deactivateColor();

      textHeight(this.mScale(.4));
      mText(value, center, .5, .5, .5);
   }

   // STORE CLICK INFORMATION FROM PREVIOUS FRAMES
   this.clickInfoCache = {
      px : null,
      py : null,
      time : -1
   };

   // To detect double click (for changing graph states)
   this.releaseClickInfoCache = {
      px : null,
      py : null,
      time : -1
   };

   this.output = function() {
      return this.graph.operationStack;
   }

   this.onPress = function(p) {
      const ci = this.clickInfoCache;
      ci.x = p.x;
      ci.y = p.y;
      ci.time = time;
   }

   this.isDoubleClick = function(p){
      const ci2 = this.releaseClickInfoCache;
      let oldTime = ci2.time;
      let curTime = time;
      let timeDiff = curTime - oldTime;
      ci2.time = curTime;
      let threshold = 0.4;
      return timeDiff < 0.3;
   }

   this.onRelease = function(p) {
      if (this.isDoubleClick(p)){
         this.graph.state = this.graph.state+1;
      } else {
         switch(this.graph.state){
            case 0:
               this.graph.state = 1;
               break;
            case 1:
               let x = Math.floor(p.x);
               let y = Math.floor(p.y);
               let posString = (x+0.5)+","+(y+0.5);
               if (this.graph.posToKey[posString] !== undefined) break;
               let node = new Graph.Node(this.graph.counter,[x+0.5,y+0.5]);
               this.graph.nodeMap[this.graph.counter] = node;
               this.graph.edgeMap[this.graph.counter] = [];
               this.graph.posToKey[posString] = this.graph.counter;
               this.graph.counter += 1;
               break;
            case 2:
               let srcKey = this.graph.posToKey[(Math.floor(this.clickInfoCache.x)+0.5) +","+ (Math.floor(this.clickInfoCache.y)+0.5)];
               let dstKey = this.graph.posToKey[(Math.floor(p.x)+0.5)+","+(Math.floor(p.y)+0.5)];
               let srcEdgeList = this.graph.edgeMap[srcKey];
               let dstEdgeList = this.graph.edgeMap[dstKey];
               if (srcKey === dstKey) break;
               if (srcEdgeList !== undefined && dstEdgeList !== undefined ){
                  srcEdgeList.push(this.graph.nodeMap[dstKey]);
                  dstEdgeList.push(this.graph.nodeMap[srcKey]);
               }
               break;
            case 3:
               let dstKey2 = this.graph.posToKey[(Math.floor(p.x)+0.5)+","+(Math.floor(p.y)+0.5)];
               let dstNode2 = this.graph.nodeMap[dstKey2];
               this.graph.breadthFirst(dstNode2);
               break;
         }
      }



   }


   this.onSwipe[3] = [
      'default graph',
      function() {
         this.graph.state = 3;
         // Draw Graph
         let defNodes = [];
         let node1 = new Graph.Node(1, [0.5,0.5]);
         let node2 = new Graph.Node(2, [3.5,-1.5]);
         let node3 = new Graph.Node(3, [-2.5,-3.5]);
         let node4 = new Graph.Node(4, [2.5,3.5]);
         let node5 = new Graph.Node(5, [-3.5,-5.5]);
         let node6 = new Graph.Node(6, [-3.5,5.5]);
         let node7 = new Graph.Node(7, [-1.5,7.5]);
         let node8 = new Graph.Node(8, [-5.5,0.5]);
         defNodes.push(node1);
         defNodes.push(node2);
         defNodes.push(node3);
         defNodes.push(node4);
         defNodes.push(node5);
         defNodes.push(node6);
         defNodes.push(node7);
         defNodes.push(node8);

         let nodeMap = {1:node1,2:node2,3:node3,4:node4,5:node5,6:node6,7:node7,8:node8};
         let nodes = {1:[node2,node3,node4,node6],2:[node1,node3,node4,node5],3:[node2,node8],4:[node1,node2],5:[node2],6:[node1,node7],7:[node6],8:[node3]};
         for (var i=0;i<defNodes.length;i++){
            let _node = defNodes[i];
            let posStr = _node.center[0]+","+_node.center[1];
            this.graph.posToKey[posStr] = _node.value;
         }
         console.log(defNodes);
         this.graph.nodeMap = nodeMap;
         this.graph.edgeMap = nodes;
      }
   ];


   this.setup = function() {
      this.graph = new Graph(this);
   }

   this.drawEdge = function(src, dst){
      let radius = 0.5;
      const nodesVec = [src.center[0] - dst.center[0], src.center[1] - dst.center[1]];
      const nodesDist = sqrt(pow(nodesVec[0], 2) + pow(nodesVec[1], 2));

      const edgeOfSrc = [src.center[0] - radius / nodesDist * nodesVec[0], src.center[1] - radius / nodesDist * nodesVec[1]];
      const edgeOfDst = [dst.center[0] + radius / nodesDist * nodesVec[0], dst.center[1] + radius / nodesDist * nodesVec[1]];
      mLine(edgeOfSrc, edgeOfDst);
   }

   this.drawEdges = function(adjList,nodeMap){
      let keys = Object.keys(adjList);
      for (var i=0;i<keys.length;i++){
         // let nodeSrcKey = adjList[i];
         let nodeSrc = nodeMap[keys[i]];
         let nodeDstList = adjList[keys[i]];
         for (var j=0;j<nodeDstList.length;j++){
            let nodeDst = nodeDstList[j];
            this.drawEdge(nodeSrc,nodeDst);
         }
      }
   }



   this.render = function() {
      this.duringSketch(function(){
         mDrawOval([-1,-1], [1,1], 32, 0, -PI);

      });
      this.afterSketch(function(){
         mText(this.graph.state, [0,8], .5, .5, .5);
         this.graph.doPendingOperation();

         if (this.graph.state === 1 || this.graph.state === 0){
            this.drawGrid();
            // TO BE FIXED
            for(var i=0;i<this.graph.counter-1;i++){ // counter is the number of nodes in the graph
               let _node = this.graph.nodeMap[i+1];
               this.drawNode(_node,i+1, this.graph.nodeMap[i+1].center);
            }
         } else {
            let nodeMap = this.graph.nodeMap;
            let nodes = this.graph.edgeMap;
            let nodeKeys = Object.keys(nodes);
            for(var i=0;i<nodeKeys.length;i++){
               let tempNode = nodeMap[nodeKeys[i]];
               this.drawNode(tempNode,tempNode.value,tempNode.center);
            }
            this.drawEdges(nodes,nodeMap);
         }





      });
   }
}
