function() {
   this.label = 'bst';


   this.props = {
      isPaused : false,
      breakpointsOn : false,
      speedFactor : 0.5
   };

   function SketchGlyphCommand(name, src, commandCallback) {
      SketchGlyph.call(this, name, src);
      this.execute = commandCallback || function() {};
   }
   SketchGlyphCommand.Null = new SketchGlyphCommand(null, [], null);
   SketchGlyphCommand.compare = function(glyph) { return glyph.WORST_SCORE; },
   SketchGlyphCommand.execute = function(args) {};

   SketchGlyphCommand.compareAll = function(curves, glyphs, tolerance = 500) {
      const drawing = new SketchGlyph(null, curves);

      let best = {glyph : SketchGlyphCommand.Null, score : drawing.WORST_SCORE, idx : -1};
      
      //console.log("GLYPHS");
      //console.log(glyphs);
      //console.log("CURVES");
      //console.log(curves);
      
      for (let i = 0; i < glyphs.length; i++) {
         const score = drawing.compare(glyphs[i]);
         if (score < best.score) {
            //console.log("FOUND BETTER");
            best.glyphMatch = glyphs[i];
            best.score = score;
            best.idx = i;
         }
      }
      
      //console.log("BEST");
      //console.log(best);

      return best;
   };

   function CurveStore() {}
   CurveStore.prototype = {
      c : [],
      beginCurve : function() {
         this.c.push([]);   
      },
      addPoint : function(p) {
         this.c[this.c.length - 1].push(p);
      },
      begin : function() {
         this.c = [];
      },
      clear : function() {
         this.c = [];
      },
      get array() {
         return this.c;
      },
      get length() {
         return this.c.length;
      },
      get lastCurve() {
         return this.c[this.c.length - 1];
      },
      get lastPoint() {
         const numCurves = this.c.length;
         const numPoints = this.c[numCurves - 1].length;
         return this.c[numCurves - 1][numPoints - 1];
      },
   };


   this.setupTree = function() {
      this.tree = new BinarySearchTree(this);
      this.tree.root = this.tree.createBSTWithDepth(3);
      this.tree.saveState();
   };

   this.setupGlyphCommands = function() {
      this.cmdGlyphs = [
         new SketchGlyphCommand("sum", [
            [[1, 1], [-1, 1], [0, 0], [-1, -1], [1, -1]]
         ], function(args) {
               args.self.tree.saveState();
               args.self.tree.addOperation({
                  sketch : args.self,
                  proc : args.self.tree.sum,
                  self : args.self.tree, 
                  root : args.self.tree.root,
                  pauseDuration : args.self.tree.calcTraversalPauseTime(),
                  callback : null,
                  callbackArgs : null
               });
            }
         ),
         new SketchGlyphCommand("pre-order", [
            [[0, 1], [-1, -1], [1, -1]]
         ], function(args) {
               args.self.tree.addOperation({
                  sketch : args.self,
                  proc : args.self.tree.preOrder,
                  self : args.self.tree, 
                  root : args.self.tree.root,
                  pauseDuration : args.self.tree.calcTraversalPauseTime(),
                  callback : null,
                  callbackArgs : null
               });
            }
         ),

         new SketchGlyphCommand("in-order", [
            [[-1, -1], [0, 1], [1, -1]]
         ], function(args) { 
               args.self.tree.addOperation({
                  sketch : args.self,
                  proc : args.self.tree.inOrder,
                  self : args.self.tree, 
                  root : args.self.tree.root,
                  pauseDuration : args.self.tree.calcTraversalPauseTime(),
                  callback : null,
                  callbackArgs : null
               });
            }
         ),

         new SketchGlyphCommand("post-order", [
            [[-1, -1], [1, -1], [0, 1]]
         ], function(args) { 
               args.self.tree.addOperation({
                  sketch : args.self,
                  proc : args.self.tree.postOrder,
                  self : args.self.tree, 
                  root : args.self.tree.root,
                  pauseDuration : args.self.tree.calcTraversalPauseTime(),
                  callback : null,
                  callbackArgs : null
               });
            }
         ),

         new SketchGlyphCommand("breadth-first", [
            [[0, 1], [-1, 0.75], [1, 0.75], [-1, 0], [1, 0]]
         ], function(args) { 
               args.self.tree.addOperation({
                  sketch : args.self,
                  proc : args.self.tree.breadthFirst,
                  self : args.self.tree, 
                  root : args.self.tree.root,
                  pauseDuration : args.self.tree.calcTraversalPauseTime(),
                  callback : null,
                  callbackArgs : null
               });
         }),
      ];      
   };

   this.setup = function() {
      //sketchCtx = this;
      this.setupTree();
      this.setupGlyphCommands();

      this.glyphCurves = new CurveStore();
      this.glyphCommandInProgress = false;

      this.isAcceptingInput = true;
   };

   this.initCopy = function() {
      //sketchCtx = this;
      const tree = this.tree;
      if (tree.historyStack.length == 0) {
         return;
      }
      if (tree.isAcceptingInput) {
         tree.historyStack = tree.historyStack.slice(tree.historyStack.length - 1);
      }
      else {
         // COPY THE TREE BEFORE AN OPERATION WAS IN PROGRESS
         tree.historyStack = tree.historyStack.slice(tree.historyStack.length - 2);
         const newBST = tree.historyStack[tree.historyStack.length - 1];
         tree.root = newBST.root;
         tree.isAcceptingInput = true;
         tree.operationMemory.active = false;
         tree.operationMemory.operation = null;
      }
      tree.resetTemporaryGraphics();
   };

   // STORE CLICK INFORMATION FROM PREVIOUS FRAMES
   this.clickInfoCache = {
      px : null,
      py : null,
      time : -1
   };


   this.onPress = function(p) {
      if (!this.sketchIsAcceptingInput()) {
         return;
      }

      const ci = this.clickInfoCache;
      ci.x = p.x;
      ci.y = p.y;
      ci.time = time;


      this.tree.resetTemporaryGraphics();
   }

   this.onRelease = function(p) {
      if (!this.sketchIsAcceptingInput()) {
         return;
      }

      const ci = this.clickInfoCache;
      if (abs(p.x - ci.x) < 0.05 &&
          abs(p.y - ci.y) < 0.05) {
         const node = this.tree.findClickedNode(this.tree.root, [ci.x, ci.y]);
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

   function unpause(entity) {
      if (!entity.breakpoint) {
         return;
      }

      entity.breakpoint.unblock();
   }

   this.onSwipe[0] = [
      'next',
      function() {
         if (!this.tree.isAcceptingInput) {
            unpause(this.tree);
         } else {
            // this.tree.breakpoint.enableBreakpoints(
            //    !this.tree.breakpoint.breakpointsAreActive
            // );
         }
      }
   ];



   this.onCmdPress = function(p) {
      if (this.glyphCommandInProgress) {
         return;
      }
      this.tree.resetTemporaryGraphics();
      this.glyphCommandInProgress = true;

      this.glyphCurves.beginCurve();
      this.onCmdDrag(p);
   };
   this.onCmdDrag = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }

      this.glyphCurves.addPoint([p.x, p.y]);
   };

   // MORE ACCURATE? 
   this.mouseDown = function(x, y, z) {
      //console.log("MOUSEDOWN");
      //this.glyphCurves.beginCurve();
      //this.mouseDrag(x, y, z);
   }
   this.mouseDrag = function(x, y, z) {
      //console.log("MOUSEDRAG");
      // if (!this.glyphCommandInProgress) {
      //    return;
      // }
      //this.glyphCurves.addPoint(this.inverseTransform([x, y, z]));
   };
   this.mouseUp = function() {
      //console.log("MOUSEUP");
      //this.glyphCurves.clear();
   };
   //////////////////////////////////////
   this.onCmdRelease = function(p) {
      if (!this.glyphCommandInProgress) {
         return;
      }

      SketchGlyphCommand.compareAll(
         this.glyphCurves.array,
         this.cmdGlyphs
      ).glyphMatch.execute({self : this});

      this.glyphCurves.clear();
      this.glyphCommandInProgress = false;
   };

   this.onDrag = function(p) {
      if (!this.sketchIsAcceptingInput()) {
         return;
      }

      const ci = this.clickInfoCache;
      // SAVE A POINT "BOUNDARY/"THRESHOLD" FOR COMPARISON
      const point = [p.x, p.y];

      const addedDepth = Math.round((ci.y - point[1]) / 2);
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

   this.output = function() {
      //return this.tree.operationStack;
      return this.tree.recursiveCallStack;
   }

   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      if (this.sketchIsAcceptingInput()) {
         if (other.label && other.label === "BST") {
            console.log("TODO: merge trees operation");
         }
         else {
            let out = other.output();
            out = Number(1 * out);

            if (isNaN(out)) {
               return;
            }

            this.tree.saveState();
            this.tree.insert(out);
         }
      }

      other.fade();
      other.delete();
   };


   this.sketchIsAcceptingInput = function() {
      return this.tree.isAcceptingInput;
   };

   this.breakpointsWereOn = false;
   // THE ELAPSED TIME MUST BE AVAILABLE AT ALL TIMES, HOW TO ENFORCE?
   this.render = function(elapsed) {
      this.duringSketch(function() {
         mCurve([
            // OUTER
            [-3.75, -2],
            [-2.5, -1],
            [0, 0],
            [2.5, -1],
            [3.75, -2],
         ]);
         mCurve([
            // INNER
            [3.75, -2],
            [1.25, -2],
            [2.5, -1]
         ]);
      });


      this.afterSketch(function() {
         const BREAKPOINTS_ON = this.prop("breakpointsOn");
         if (!BREAKPOINTS_ON && this.breakpointsWereOn) {
            unpause(this.tree);
         }


         //console.log(this.prop("isPaused"));

         const IS_BLOCKED = this.prop("isPaused") || (this.tree.doPendingOperation(BREAKPOINTS_ON) == -1);
         this.breakpointsWereOn = BREAKPOINTS_ON;

         this.tree.drawTree();

         if (IS_BLOCKED) {
            textHeight(this.mScale(0.8));
            mText("||", [0.0, 1.0], .5, .5, .5);
         }

         _g.save();
         color("cyan");
         lineWidth(1);
         const curves = this.glyphCurves.array;
         for (let i = 0; i < curves.length; i++) {
            mCurve(curves[i]);
         }
         _g.restore();
      });
   };
}
