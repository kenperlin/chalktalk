"use strict";

// DECIDED TO SEPARATE "HEAVIER IMPLEMENTATION" FROM SOME OF THE RELEVANT SKETCHES FOR NOW

let Location = (function() {
   let pos = {};
   pos.Position = function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = (z === undefined) ? 0 : z;

      // BASIC ADDITION AND SUBTRACTION OF POINTS (IN PRACTICE, PERHAPS THEY ARE MORE LIKE VEC3s, WHICH I COULD POSSIBLY USE INSTEAD)
      //

      this.plus = function(other) {
         return new Location.Position(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
         );
      };

      this.plusEquals = function(other) {
         this.x += other.x;
         this.y += other.y;
         this.z += other.z;
         return this;
      };

      this.plusArr = function(otherAsArr) {
         return new Location.Position(
            this.x + otherAsArr[0],
            this.y + otherAsArr[1],
            this.z + otherAsArr[2]
         ); 
      };

      this.plusEqualsArr = function(otherAsArr) {
         this.x += otherAsArr[0],
         this.y += otherAsArr[1],
         this.z += otherAsArr[2]
         return this;
      };

      //
      this.minus = function(other) {
         return new Location.Position(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
         );
      };

      this.minusEquals = function(other) {
         this.x -= other.x;
         this.y -= other.y;
         this.z -= other.z;
         return this;
      };

      this.minusArr = function(otherAsArr) {
         return new Location.Position(
            this.x - otherAsArr[0],
            this.y - otherAsArr[1],
            this.z - otherAsArr[2]
         ); 
      };

      this.minusEqualsArr = function(otherAsArr) {
         this.x -= otherAsArr[0],
         this.y -= otherAsArr[1],
         this.z -= otherAsArr[2]
         return this;
      };

      // SWAP COORDINATES BETWEEN POSITION OBJECTS
      this.swap = function(other) {
         let storeXYZ = this.xyz();
         this.x = other.x;
         this.y = other.y;
         this.z = other.z;
         other.x = storeXYZ[0];
         other.y = storeXYZ[1];
         other.z = storeXYZ[2];
      };

      this.distance = function(other) {
         const dx = other.x - this.x;
         const dy = other.y - this.y;
         return sqrt((dx * dx) + (dy * dy));
      }

      // RETURN THE XYZ COORDINATES AS A LEN-3 ARRAY
      this.xyz = function() {
         return [this.x, this.y, this.z];
      };

      // RETURN THE XY COORDINATES AS A LEN-2 ARRAY (NO TRANSFORMATION)
      this.xy = function() {
         return [this.x, this.y];
      }
   };

   // RETURN A (0, 0, 0) Position OBJECT
   pos.CartesianOrigin = function() {
      return new Location.Position(0, 0, 0);
   }
   // RETURN A POSITION OBJECT REPRESENTING THE 
   // TOP-LEFT CORNER POSITION OF AN ITEM OF DIMENSION dim 
   // IF IT WERE TO BE DRAWN AT the (0, 0, 0) ORIGIN
   pos.ObjectCenter = function(dim) {
      let w = dim.w;
      let h = dim.h;
      let d = dim.d;
      return new Location.Position(
         -w / 2,
         h / 2,
         d / 2
      );
   }

   return pos;

})();

let Dimension = (function() {
   let dim = {};
   
   dim.Dimension = function(w, h, d) {
      this.w = w;
      this.h = h;
      this.d = (d === undefined) ? 0 : d;
   };
   
   return dim;
})();



let Bound = (function() {
   let shape = {};

   // GIVEN A POSITION (TOP-LEFT CORNER) AND DIMENSION, DRAW A BASIC RECTANGLE
   shape.drawRect = function(pos, dim) {
      let x = pos.x;
      let y = pos.y;
      let z = pos.z; 
      let w = dim.w;
      let h = dim.h;
      let d = dim.d;

      if (d == 0) {
         mCurve([
            [x, y, z], 
            [x, y - h, z], 
            [x + w, y - h, z], 
            [x + w, y, z],
            [x, y, z]
         ]);
      }
      else {
         mCurve([
            [x, y, z + (d / 2)], 
            [x, y - h, z + (d / 2)], 
            [x + w, y - h, z + (d / 2)], 
            [x + w, y, z + (d / 2)],
            [x, y, z + (d / 2)]
         ]);
         mCurve([
            [x, y, z - (d / 2)], 
            [x, y - h, z - (d / 2)], 
            [x + w, y - h, z - (d / 2)], 
            [x + w, y, z - (d / 2)],
            [x, y, z - (d / 2)]
         ]);

         mCurve([
            [x, y, z + (d / 2)], 
            [x, y, z - (d / 2)],
            [x + w, y, z - (d / 2)], 
            [x + w, y, z + (d / 2)],
            [x, y, z + (d / 2)]
         ]);
         mCurve([
            [x, y - h, z + (d / 2)], 
            [x, y - h, z - (d / 2)],
            [x + w, y - h, z - (d / 2)], 
            [x + w, y - h, z + (d / 2)],
            [x, y - h, z + (d / 2)]
         ]);

         mCurve([
            [x, y, z + (d / 2)], 
            [x, y, z - (d / 2)],
            [x, y - h, z - (d / 2)], 
            [x, y - h, z + (d / 2)],
            [x, y, z + (d / 2)]
         ]);
         mCurve([
            [x + w, y, z + (d / 2)], 
            [x + w, y, z - (d / 2)],
            [x + w, y - h, z - (d / 2)], 
            [x + w, y - h, z + (d / 2)],
            [x + w, y, z + (d / 2)]
         ]); 
      }
   }

   shape.fillRect = function(pos, dim) {
      let x = pos.x;
      let y = pos.y;
      let z = pos.z; 
      let w = dim.w;
      let h = dim.h;
      let d = dim.d // TODO depth
      if (d == 0) {
         mFillCurve([
            [x, y, z], 
            [x, y - h, z], 
            [x + w, y - h, z], 
            [x + w, y, z],
            [x, y, z]
         ]);
      }
      else {
         mFillCurve([
            [x, y, z + (d / 2)], 
            [x, y - h, z + (d / 2)], 
            [x + w, y - h, z + (d / 2)], 
            [x + w, y, z + (d / 2)],
            [x, y, z + (d / 2)]
         ]);
         mFillCurve([
            [x, y, z - (d / 2)], 
            [x, y - h, z - (d / 2)], 
            [x + w, y - h, z - (d / 2)], 
            [x + w, y, z - (d / 2)],
            [x, y, z - (d / 2)]
         ]);

         mFillCurve([
            [x, y, z + (d / 2)], 
            [x, y, z - (d / 2)],
            [x + w, y, z - (d / 2)], 
            [x + w, y, z + (d / 2)],
            [x, y, z + (d / 2)]
         ]);
         mFillCurve([
            [x, y - h, z + (d / 2)], 
            [x, y - h, z - (d / 2)],
            [x + w, y - h, z - (d / 2)], 
            [x + w, y - h, z + (d / 2)],
            [x, y - h, z + (d / 2)]
         ]);

         mFillCurve([
            [x, y, z + (d / 2)], 
            [x, y, z - (d / 2)],
            [x, y - h, z - (d / 2)], 
            [x, y - h, z + (d / 2)],
            [x, y, z + (d / 2)]
         ]);
         mFillCurve([
            [x + w, y, z + (d / 2)], 
            [x + w, y, z - (d / 2)],
            [x + w, y - h, z - (d / 2)], 
            [x + w, y - h, z + (d / 2)],
            [x + w, y, z + (d / 2)]
         ]);   
      }
   }

   shape.drawNothing = function() {return;};

   // BOUNDING BOX REPRESENTING POSITION AND DIMENSIONS, SPECIFY A FUNCTION FOR DRAWING (E.G. THE PROVIDED drawRect(...) OR A CUSTOM PROCEDURE)
   shape.BoundRect = function(pos, dimensions, func) {
      this.pos = pos;
      this.dim = dimensions;
      this.func = (func === undefined) ? Bound.drawRect : func;

      // DRAW CURRENT POSITION WITH OR WITHOUT OFFSET
      this.draw = function(offsetPos) {
         this.func((offsetPos === undefined) ? this.pos : this.pos.plus(offsetPos), this.dim); // z coordinate to do
      };

      this.drawWithFunc = function(func, offsetPos) {
         func((offsetPos === undefined) ? this.pos : this.pos.plus(offsetPos), this.dim); // z coordinate to do         
      }

      // DRAW AT A SPECIFIC POSITION, OPTIONALLY WITH SPECIFIC DIMENSIONS (IGNORE THE BOUNDING RECTANGLE'S DATA FOR THIS DRAW)
      this.drawAt = function(pos, dim) {
         this.func(pos, (dim === undefined) ? this.dim : dim);
      }

      this.drawAtWithFunc = function(pos, dim, func) {
         func(pos, (dim === undefined) ? this.dim : dim);         
      }

      this.drawSelectionRect = function() {
         let pos = this.bound.pos.plusArr([-.1, .1, 0]);
         let dim = new Dimension.Dimension(this.bound.dim.w + 0.2, this.bound.dim.h + 0.2);
         Bound.drawRect(pos, dim);
      };
   };

   // TODO BOUNDING SPHERE?

   return shape;
})();

let Pointer = (function() {
   let p = {};

   p.PointerGraphic = function(posFromFunc, posToFunc, name, bound, pos) {
      this.getPosFrom = posFromFunc;
      this.getPosTo = posToFunc;
      this.name = name;
      this.pos = pos;

      if (bound === undefined || bound === null) {
         this._hasBound = false;
      } 
      else {
         this.bound = bound;
         this._hasBound = true;
      }

      let that = this;

      this.hasBound = function() {
         return this._hasBound;
      };

      // DRAW POINTER ARROW, DYNAMICALLY FIND EXIT AND ENTRY POINTS
      this.draw = function(ctContext, structure, boundPos, shouldDrawLabel) {

         if (ctContext.isArgList) { 
            let args = ctContext;
            ctContext = args.ctContext;
            structure = args.structure;
            boundPos = args.boundPos;
            shouldDrawLabel = args.shouldDrawLabel;
         }

         // DRAW POINTER BOUND IF EXISTS
         if (that.hasBound()) {
            let dim = new Dimension.Dimension(that.bound.dim.w, (structure === null) ? that.bound.dim.h : structure.bound.dim.h, that.bound.dim.d);
            that.bound.drawAt(boundPos, dim);
         }

         // FIND THE POINTER START AND POINTEE POSITIONS
         let posA = that.getPosFrom(that, structure, boundPos);
         let posB = that.getPosTo(that, structure);

         _g.save();
            color("violet");

            // DRAW THE POINTER ARROW
            // NOTE, INSERT BETTER ARROW / CURVE PROCEDURE HERE GIVEN THE TWO POINTS
            // mCurve([[posA.x, posA.y, posA.z], [posB.x, posB.y, posB.z]]);

            // DRAW EXIT CIRCLE
            const EXIT_RADIUS = 0.03;
            //mFillDisk(posA.xy(), EXIT_RADIUS);

            // OVAL DRAWN AT SPECIFIC POSITION WOULD BE BETTER, TAKEN FROM mask.js BUT BROKEN IN THIS CONTEXT ??? TODO
            function mFillOvalMask(p, r) {
               var c = [];
               for (var i = 0 ; i < 24 ; i++) {
                  var theta = i * TAU / 24;
                  c.push([p[0] + r * cos(theta), p[1] + r * sin(theta), p[2]]);
               }
               mFillCurve(c);
            }

            mFillOvalMask(posA.xyz(), EXIT_RADIUS);

            // DRAW THE ARROW AT THE TIP
            // function mArrowHead(a, b, r) {
            //    if (r === undefined) r = 0.1;

            //    a[2] = def(a[2]);
            //    b[2] = def(b[2]);

            //    var A = mTransform(a);
            //    var B = mTransform(b);

            //    var U = [ r * (B[0] - A[0]), r * (B[1] - A[1]), r * (B[2] - A[2]) ];

            //    _g_beginPath();
            //    _g_sketchTo([ B[0]-U[0]+U[1], B[1]-U[1]-U[0], B[2]-U[2] ], 0);
            //    _g_sketchTo(B, 1);
            //    _g_sketchTo([ B[0]-U[0]-U[1], B[1]-U[1]+U[0], B[2]-U[2] ], 1);
            //    _g_stroke();  
            // }

            // TODO AVOID USING A CONDITIONAL HERE?
            const dist = posA.distance(posB);
            if (dist < 0.5) {
               //mArrowHead([posA.x, posA.y, posA.z], [posB.x, posB.y, posB.z], 0.5);
               mArrow([posA.x, posA.y, posA.z], [posB.x, posB.y, posB.z], 0.5);
            }
            else {
               //mArrowHead([posA.x, posA.y, posA.z], [posB.x, posB.y, posB.z], .06);
               mArrow([posA.x, posA.y, posA.z], [posB.x, posB.y, posB.z], .06);
            }
            
            // DRAW POINTER LABEL
            if (shouldDrawLabel) {
               textHeight(ctContext.mScale(.14));
               mText(that.name, [(posA.x + posB.x) / 2, (posA.y + posB.y) / 2, (posA.z + posB.z) / 2], .5, -1.5, .5);
            }

         _g.restore();
      }
   };

   // https://stackoverflow.com/questions/10281115/is-there-a-better-way-to-simulate-pointers-in-javascript
   // p.createPointerSim = function(read, write) {
   //    return {
   //       get value() { return read(); }, set value(v) { return write(); }
   //    };
   // };
   // pass in pointee as [value]
   // p.createPointerSim = function(pointeeAsArray) {
   //    return {
   //       v : pointeeAsArray,
   //       get value() {
   //          return this.v[0];
   //       },
   //       set value(val) {
   //          this.v[0] = val;
   //       },
   //       set pointee(_pointeeAsArray) {
   //          this.v = _pointeeAsArray
   //       }
   //    };
   // }


   return p;
})();

let DSNode = (function() {
   let node = {};
   // BASIC INTERFACE FOR NODE, MAY CHANGE
   node.Node = function(container, payload, bound, drawableElements, pointers) {
      this.container = container;
      this.payload = payload;
      this.bound = bound;
      this.drawableElements = drawableElements;
      this.pointers = pointers;
   };

   return node;
})();

let LinkedList = (function() {
   const linkedlist = {};

   linkedlist.SinglyLinkedNode = function(container, payload, bound, drawableElements, pointers) {
      DSNode.Node.call(this, container, payload, bound, drawableElements, pointers);
      this.next = null;

      let that = this;

      // PERMANENTLY OFFSET THE NODE COORDINATES
      this.posOffset = function(offsetPos) {
         let pos = this.bound.pos;
         pos.x += offsetPos.x;
         pos.y += offsetPos.y;
         pos.z += offsetPos.z;
      }

      this.posSet = function(newPos) {
         let pos = this.bound.pos;
         pos.x = newPos.x;
         pos.y = newPos.y;
         pos.z = newPos.z;
      }

      // DRAW NODE AND RECURSIVELY DRAW ALL ELEMENTS
      this.draw = function(tempOffsetPos) {
         // DRAW NODE BOUNDARY
         this.bound.draw(tempOffsetPos);

         // UNUSED EXTRA DRAWABLE ELEMENTS TODO ?
         for (let i = 0; i < this.drawableElements.length; i++) {
            this.drawableElements[i].draw(this, tempOffsetPos);
         }

         if (tempOffsetPos === undefined) {
            tempOffsetPos = Location.CartesianOrigin();
         }

         let offsetX = tempOffsetPos.x;
         let offsetY = tempOffsetPos.y;
         let offsetZ = tempOffsetPos.z;
         
         let horizontalPayloadShift = 0;
         // SET-UP POINTER BOUND AND POINTER LINK POSITIONS (DOES NOT SET, ALL BASED ON OFFSETS FROM NODE BOUND FOR NOW)
         for (let i = 0; i < this.pointers.length; i++) {
            // START BY ALIGNING THE DESIRED POINTER BOUND ON THE RIGHT OF THE NODE BOUND
            let ptrBoundPos = this.bound.pos.plusArr([this.bound.dim.w, 0, 0]);

            let ptrI = this.pointers[i];
            if (ptrI.hasBound()) {
               // MOVE THE DESIRED POINTER BOUND(s) LEFTWARDS INTO THE NODE BOUND SPACE
               ptrBoundPos.minusEqualsArr([ptrI.bound.dim.w * (i + 1), 0, 0]);
               horizontalPayloadShift += ptrI.bound.dim.w;
            }

            // SET-UP DEFERRED DRAWS
            let deferred = {
               func : ptrI.draw,
               args : {
                  isArgList : true,
                  ctContext : this.container.ctContext,
                  structure : this,
                  boundPos : ptrBoundPos,
                  shouldDrawLabel : true
               }
            };

            this.container.enqueueDrawDeferred(deferred);

            // DRAWING IMMEDIATELY RESULTED IN A JITTERY LOOK SINCE THE "NEXT" NODES MIGHT MOVE IN THEIR UPDATE PROCEDURES, TODO ALTERNATE SOLUTION?
            // RESPONSE BY ME : TWO COMPLETE LOOPS IN UPDATE FUNCTIONS, FIRST OFFSETS, SECOND DRAWS, NOT GREATEST SOLUTION, BUT WORKS
            //ptrI.draw(this.container.ctContext, this, ptrBoundPos, true);
         }

         // DRAW THE PAYLOAD AS TEXT, TODO OR DEFINE A "PAYLOAD" OBJECT REPRESENTATION FOR SOMETHING FANCIER?
         textHeight(this.container.ctContext.mScale(.2));
         let p = [this.bound.pos.x + .5 + offsetX - (horizontalPayloadShift / 2), this.bound.pos.y - (this.bound.dim.h / 2) + offsetY, this.bound.pos.z + (this.bound.dim.d / 2) + 0.05 + offsetZ];
         mText(this.payload, p, 0.5, 0.5);
      };

      // OBJECTS TO WHICH WE CAN POINT (POINTEES) SHOULD DEFINE THIS FUNCTION TO SPECIFY A "POINT AT ME HERE" POSITION
      this.getPointeePos = function() {
         let pos = this.bound.pos;
         return new Location.Position(pos.x, pos.y - (this.bound.dim.h / 2), pos.z);
      };

   };

   linkedlist.SinglyLinkedNode.defaultDimension = function() {
      return new Dimension.Dimension(1, .5, 0);
   };

   linkedlist.SinglyLinked = function(ctContext) {
      // OUTER POINTER TO OBJECT
      let that = this;
      this.ctContext = ctContext;
      this.head = null;
      this._size = 0;

      this.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
      this.mostRecentlyChangedNode = this.head;

      // SOME ELEMENTS (POINTER LINKS FOR EXAMPLE) FULLY UPDATED ONLY AFTER EACH NODE HAS BEEN UPDATED,
      // SO FOR NOW IT IS NECESSARY TO DEFER DRAWING OF THOSE ELEMENTS TO A POINT AFTER THE INITIAL UPDATES
      this._deferredDrawQueue = [];
      this.enqueueDrawDeferred = function(item) {
         this._deferredDrawQueue.push(item);
      };
      this.drawDeferred = function() {
         for (let i = 0; i < this._deferredDrawQueue.length; i++) {
            let args = this._deferredDrawQueue[i].args;
            //this._deferredDrawQueue[i].func(args[0], args[1], args[2], args[3]); // TODO: SHOULD MAKE ARGS AN OBJECT LATER
            this._deferredDrawQueue[i].func(args);
         }
         this._deferredDrawQueue = [];
      };


      // TODO make sentinel nodes for organization (?)
      // this.headSentinel = ...
      // this.nullSentinel = ...

      this.headGraphic = (function() {
         const h = {};
         h.ptr = new Pointer.PointerGraphic(
                     // PROCEDURE TO LOCATE POINTER OUT POSITION DYNAMICALLY
                     function(pointer, node, boundPos) {
                        // if (!pointer.hasBound()) {
                        //    return pointer.pos;
                        // }

                        // let pPos = pointer.pos;

                        // return boundPos.plus(pPos);
                        return pointer.pos;
                     },
                     // PROCEDURE TO LOCATE POINTER IN (POINTEE) POSITION DYNAMICALLY
                     function(pointer, node) {
                        if (node !== null) {
                           return node.getPointeePos();
                        }
                        return new Location.Position(0 - .25, 0, 0);
                     },
                     "head",
                     new Bound.BoundRect(
                        Location.ObjectCenter(new Dimension.Dimension(.25, .5, 0)).minusEqualsArr([1, 1, 0]),
                        new Dimension.Dimension(.25, .5, 0),
                        Bound.drawRect
                     ),
                     new Location.Position(-1, -1, 0)
         );

         h.draw = function(_color) {
            if (color !== undefined) {
               _g.save();
               color(_color);
               h.ptr.draw(that.ctContext, that.head, h.ptr.bound.pos, true);
               _g.restore();
            }
            else {
               h.ptr.draw(that.ctContext, that.head, h.ptr.bound.pos, true);
            }
         };

         return h;
      })();

      this.createBasicNodeGraphic = function(that, payload) {
         let defaultDims = LinkedList.SinglyLinkedNode.defaultDimension();
         let DEPTH = 0.0;
         //DEPTH = 0.1;
         defaultDims.d = DEPTH;

         // RANDOMIZE DEFAULT POSITION OF NODE TO AVOID "STATIC LOOK"
         let boundPos = Location.ObjectCenter(defaultDims).plusEqualsArr(
               [THREE.Math.randFloat(-.1, .1), THREE.Math.randFloat(-.4, .4), THREE.Math.randFloat(-.4, 0)] // bug with moving towards camera?
         );

         let newNode = new LinkedList.SinglyLinkedNode(
            // POINTER TO THE CONTAINER (e.g. list)
            that,
            // PAYLOAD STORED
            payload,
            // BOUND FOR THE NODE
            new Bound.BoundRect(
               boundPos,
               defaultDims,
               Bound.drawRect
            ),
            [
               {
                  draw : function() {
                     _g.save();
                     color(backgroundColor);
                     newNode.bound.drawWithFunc(Bound.fillRect);
                     _g.restore();
                  }
               }
            ],
            [
               new Pointer.PointerGraphic(
                  // PROCEDURE TO LOCATE POINTER OUT POSITION DYNAMICALLY
                  function(pointer, node, boundPos) {
                     if (!pointer.hasBound()) {
                        return pointer.pos;
                     }

                     let pPos = pointer.pos;

                     return boundPos.plus(pPos);
                  },
                  // PROCEDURE TO LOCATE POINTER IN (POINTEE) POSITION DYNAMICALLY
                  function(pointer, node) {
                     if (node.next !== null) {
                        return node.next.getPointeePos();
                     }
                     let pos = node.bound.pos; 
                     return new Location.Position(pos.x + (that.HORIZONTAL_OFFSET * .8), /*pos.y - (pointer.bound.dim.h / 2)*/ 0, 0);
                  },
                  "next",
                  new Bound.BoundRect(
                     Location.ObjectCenter(defaultDims),
                     new Dimension.Dimension(.25, .5, DEPTH),
                     Bound.drawRect
                  ),
                  new Location.Position(0.125, -0.25, 0)         
               ),
            ]
         );

         return newNode;
      }


      this.insertFront = function(payload) {
         this.currOperation = LinkedList.SinglyLinked.Operation.INSERT_FRONT;

         let newNode = this.createBasicNodeGraphic(this, payload);

         newNode.next = this.head;
         this.head = newNode;
         this.incSize();

         this.mostRecentlyChangedNode = this.head;
      };

      // TEMPORARY FOR DEMONSTRATION
      this.insertByPtr = function(payload, postInsertionPointNode) { // TODO MUST ADD THE STATE SYSTEM WITH MORE OPERATIONS FOR FUTURE INCORPORATION OF ANIMATIONS
         if (postInsertionPointNode === null) {
            this.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
            return;
         }
         else if (postInsertionPointNode === this.head) {
            this.insertFront(payload);
            return;
         }

         this.currOperation = LinkedList.SinglyLinked.Operation.INSERT_FRONT;

         let newNode = this.createBasicNodeGraphic(this, payload);
         newNode.next = postInsertionPointNode;

         let curr = this.head;
         while (curr !== null && curr.next !== postInsertionPointNode) {
            curr = curr.next;
         }
         if (curr !== null) {
            curr.next = newNode;
            this.incSize();
         }

         this.mostRecentlyChangedNode = (curr === null) ? this.head : curr;         
      };

      this.removeFront = function() {
         if (this.size() <= 0) {
            return;
         }
         this.currOperation = LinkedList.SinglyLinked.Operation.REMOVE_FRONT;

         let toRemove = this.head;
         this.head = this.head.next;
         toRemove.next = null;
         this.decSize();

         this.mostRecentlyChangedNode = this.head;
         return toRemove;
      };

      this.removeByPtr = function(nodeToRemove) {
         if (this.size() <= 0) {
            return;
         }
         this.currOperation = LinkedList.SinglyLinked.Operation.REMOVE_ARBITRARY;

         let prev = null;
         let curr = this.head;

         while (curr !== null && curr !== nodeToRemove) {
            prev = curr;
            curr = curr.next;
         }
         if (curr === null) {
            this.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
            return null;
         }

         let toRemove = curr;
         if (prev === null) {
            this.head = curr.next;
         }
         else {
            prev.next = curr.next;
         }
         this.mostRecentlyChangedNode = prev;
         toRemove.next = null;
         this.decSize();
         this.selectedStructure = null;
         return toRemove;
      };

      this.removeByData = function(dataToRemove) {
         if (this.size() <= 0) {
            return;
         }
         this.currOperation = LinkedList.SinglyLinked.Operation.REMOVE_ARBITRARY;

         let prev = null;
         let curr = this.head;

         while (curr !== null && curr.payload != dataToRemove) {
            prev = curr;
            curr = curr.next;
         }

         if (curr === null) {
            this.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
            return null;
         }

         let toRemove = curr;
         if (prev === null) {
            this.head = curr.next;
         }
         else {
            prev.next = curr.next;
         }
         this.mostRecentlyChangedNode = prev;
         this.decSize();
         this.selectedStructure = null;
         return toRemove;
      };

      this.incSize = function() {
         this._size++;
      };

      this.decSize = function() {
         this._size--;
      };

      this.size = function() {
         return this._size;
      };

      this._setSize = function(newSize) {
         this._size = newSize;
      } 

      // INTERNAL ONE-SHOT IN-PLACE LIST REVERSAL
      this.reverseInPlace = function() {
         let curr = this.head;
         let prev = null;
         while (curr !== null) {
            let next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
         }
         this.head = prev;
         
         ///////////////////////////////////////////////////

         let listSave = [];
         curr = this.head;
         while (curr !== null) {
            listSave.push(curr);
            curr = curr.next;
         }

         let i = 0;
         let j = listSave.length - 1;
         let posI = null;
         let posJ = null;
         while (i < j) {
            posI = listSave[i].bound.pos;
            posJ = listSave[j].bound.pos;
            posI.swap(posJ);

            i++;
            j--;
         }

         this.mostRecentlyChangedNode = this.head;
         console.log("REVERSED");
      };

      // TODO STEP-THROUGH ALGORITHM TODO -- VERY MUCH SO
      this._reverseInPlace = Stepthrough.makeStepFunc(function*() {
         let curr = this.head;
         let prev = null;
         yield;
         while (curr !== null) {
            let next = curr.next;
            yield;
            curr.next = prev;
            yield;
            prev = curr;
            curr = next;
         }
         this.head = prev;
         yield;
      });

      // TODO
      this._merge = function() {
         this.currOperation = "merge";
      }
      // TODO
      this._compact = function() {
         this.currOperation = "COMPACT";
      }

      this.nodeMap = []; // for better point range query-based node find algorithm? WOULD APPRECIATE HELP WITH THIS TODO ^2

      this.selectedStructure = null;
      this.getSelectedStructure = function() {
         return this.selectedStructure;
      };
      this.boundAndPointCollide2D = function(b, p) {
         let pos = b.pos;
         let x = pos.x;
         let y = pos.y;

         if (x > p.x || y < p.y) {
            return false;
         }
         let dim = b.dim;
         if (x + dim.w < p.x || y - dim.h > p.y) {
            return false;
         }
         return true;
      };
      this.boundAndPointCollide3D = function(b, p) { // TODO , BUGGY
         let pos = b.pos;
         let dim = b.dim;
         let w = dim.w;
         let h = dim.h;
         let d = dim.d;

         let x = pos.x;
         let y = pos.y;
         let z = pos.z;

         console.log("mouseZ: " + p.z + " boundZBack: " + (z - (d / 2)) + " boundZFront: " + (z + (d / 2)));

         if (x > p.x || y < p.y || z - (d / 2) > p.z) {
            return false;
         }
         if (x + w < p.x || y - h > p.y || z + (d / 2) < p.z) {
            return false;
         }
         return true;
      };
      this.findClickedStructure = function(p) {
         let curr = this.head;
         while (curr !== null) {
            if (this.boundAndPointCollide2D(curr.bound, p)) {
               return {
                  structure : curr, 
                  pos : curr.getPointeePos()
               };
            }
            curr = curr.next;
         }
         return null;
      };
      this.selectSubstructure = function(p) {
         this.selectedStructure = this.findClickedStructure(p);
      };
      
      // SEPARATE DRAW LOOP "STATES" POSSIBLY FOR USE WITH SMOOTHER ANIMATION / TRANSITIONS, "currOperation" CONTROLS WHICH SUB-ROUTINE TO RUN
      //this.opQueue = [];
      this.HORIZONTAL_OFFSET = 2; // SHOULD BE VARIABLE 
      this.state = "all";
      this.states = {
         "all" : {
            [LinkedList.SinglyLinked.Operation.IDLE] : function(that) {
               //that.opQueue.push("NONE");
               let nullTailOffset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);

               let curr = that.head;
               while (curr !== null) {
                  //m.translate([0, sin(time + (0.5 * i)), 0]);
                  //curr.bound.dim.h = sin(curr.bound.dim.h + time * 0.1); // silliness here !
                  curr.draw();
                  nullTailOffset.x = curr.bound.pos.x;
                  
                  curr = curr.next;
               }

               that.headGraphic.draw("violet");

               textHeight(that.ctContext.mScale(.2));
               _g.save();
               color("rgb(10, 40, 120)");
               mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
               _g.restore();
               that.drawDeferred();

               if (that.selectedStructure === null) {
                  return;
               }

               _g.save();
               color("blue");
               //that.selectedStructure.bound.drawSelectionRect();
               Bound.drawRect(that.selectedStructure.structure.getPointeePos().plusArr([-.1, .1, 0]), new Dimension.Dimension(.2, .2, .2));
               _g.restore();
            },
            [LinkedList.SinglyLinked.Operation.INSERT_FRONT] : function(that) {
               //that.opQueue.push("insertFront");
               let nullTailOffset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);
               let offset = Location.CartesianOrigin();

               let curr = that.head;
               while (curr !== null) {
                  // UPDATE POSITIONS, SHIFTING RIGHTWARDS TO ACCOMODATE THE NEW NODE
                  curr.posOffset(offset);
                  curr.draw();

                  nullTailOffset.x = curr.bound.pos.x;

                  curr = curr.next;
                  offset.x = that.HORIZONTAL_OFFSET;
               }

               that.headGraphic.draw("violet");
               // curr = that.head;
               // while (curr !== null) {
               //    curr.draw();
               //    curr = curr.next;
               // }

               textHeight(that.ctContext.mScale(.2));
               _g.save();
               color("rgb(10, 40, 120)");
               mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
               _g.restore();
               that.drawDeferred();

               // MUST RESET STATE
               that.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
            },
            [LinkedList.SinglyLinked.Operation.REMOVE_FRONT] : function(that) {
               if (that.size() <= 0) {
                  that.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
                  return;
               }
               //that.opQueue.push("removeFront");
               let nullTailOffset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);
               let offset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);

               let curr = that.head;
               while (curr !== null) {
                  // UPDATE POSITIONS, SHIFTING LEFTWARDS TO ACCOMODATE THE EMPTY SPACE LEFT BY REMOVED NODE
                  curr.posOffset(offset);
                  curr.draw();
                  nullTailOffset.x = curr.bound.pos.x;

                  curr = curr.next;
               }

               that.headGraphic.draw("violet");
               // curr = that.head;
               // while (curr !== null) {
               //    curr.draw();
               //    curr = curr.next;
               // }

               textHeight(that.ctContext.mScale(.2));
               _g.save();
               color("rgb(10, 40, 120)");
               mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
               _g.restore();
               that.drawDeferred();

               // RESET STATE
               that.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
            },
            [LinkedList.SinglyLinked.Operation.REMOVE_ARBITRARY] : function(that) {
               if (that.size() <= 0) {
                  that.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
                  return;
               }

               let nullTailOffset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);
               let offset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);

               let curr = that.head;
               while (curr !== null && 
                        that.mostRecentlyChangedNode !== null && 
                        curr !== that.mostRecentlyChangedNode.next)
               {
                  curr.draw();
                  nullTailOffset.x = curr.bound.pos.x;
                  
                  curr = curr.next;
               }
               while (curr !== null) {
                  // UPDATE POSITIONS, SHIFTING LEFTWARDS TO ACCOMODATE THE EMPTY SPACE LEFT BY REMOVED NODE 
                  // TODO, distance shouldn't be constant, should be calculated based on removed distance when node was removed
                  curr.posOffset(offset);
                  curr.draw();
                  nullTailOffset.x = curr.bound.pos.x;

                  curr = curr.next;                  
               }

               that.headGraphic.draw("violet");

               textHeight(that.ctContext.mScale(.2));
               _g.save();
               color("rgb(10, 40, 120)");
               mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
               _g.restore();
               that.drawDeferred();

               // RESET STATE
               that.currOperation = LinkedList.SinglyLinked.Operation.IDLE;
            },
            "COMPACT" : function(that) {

               let defaultDims = LinkedList.SinglyLinkedNode.defaultDimension();
               let boundPos = Location.ObjectCenter(defaultDims);
               let nullTailOffset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);

               let curr = that.head;

               let i = 0;
               while (curr !== null) {
                  curr.posSet(boundPos.plusArr([defaultDims.w * i, 0, 0]));
                  curr.draw();

                  nullTailOffset.x = curr.bound.pos.x;
                  curr = curr.next;
                  i++;
               }

               that.headGraphic.draw("violet");

               textHeight(that.ctContext.mScale(.2));
               _g.save();
               color("rgb(10, 40, 120)");
               mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
               _g.restore();

               that.drawDeferred();

               // RESET STATE
               that.currOperation = LinkedList.SinglyLinked.Operation.IDLE;

               console.log("COMPACTED ??? (Will break because of currently constant offsets between un-compacted nodes");              
            },
            // TODO [REVERSE_IN_PLACE] : function(that) {}
            // TODO [MERGE] : function(that) {
                  // UN-IMPLEMENTED
                     // let nullTailOffset = new Location.Position(-that.HORIZONTAL_OFFSET, 0, 0);
                     // textHeight(that.ctContext.mScale(.2));

                     // let posArr = [];
                     // let curr = that.head;
                     // while (curr !== null) {
                     //    posArr.push([curr.bound.pos, curr]);
                     //    curr = curr.next;
                     // }
                     // _g.save();
                     // color("rgb(10, 40, 120)");
                     // mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
                     // _g.restore();
                     // that.drawDeferred();
                     // that.currOperation = "NONE";               
            //},

         }
      };
      this.states["all"] = Object.freeze(this.states["all"]);

      this.scheduleOperation = function(operation, args) {
         if (operation === undefined) {
            return;
         }
         this.currOperation = operation;
      };

      // MAIN DRAW PROCEDURE FOR LIST
      this.update = function() {
         this.states[this.state][this.currOperation](this);
      };

      // DEBUG CONSOLE PRINT-OUT OF LIST
      this.asString = null;
      this.print = function() {
         let strOut = "head->";
         let curr = this.head;
         while (curr !== null) {
            strOut += "[" + curr.payload + "]->";
            curr = curr.next;
         }
         strOut += "NULL";
         if (strOut === this.asString) {
            return;
         }
         this.asString = strOut;
         console.log(strOut);
      };
   };

   linkedlist.SinglyLinked.Operation = Object.freeze({
      IDLE : '1',
      INSERT_FRONT : '2',
      REMOVE_FRONT : '3',
      INSERT_ARBITRARY : '4',
      REMOVE_ARBITRARY : '5',
      REVERSE_IN_PLACE : '6',
   });
   linkedlist.SinglyLinked.StepOperation = Object.freeze({
      INSERT_FRONT : '7',
      REMOVE_FRONT : '8',
      INSERT_ARBITRARY : '9',
      REMOVE_ARBITRARY : '10',
      REVERSE_IN_PLACE : '11',
   });

   // THE FUTURE?
   // linkedlist.DoublyLinked = function(ctContext) {
   //    this.ctContext = ctContext;
   //    this.head = null;
   //    this.tail = null;
   //    this._size = 0;

   //    this.currOperation = "NONE";
   //    this.nodeBeginUpdate = this.head;
   // };

   return linkedlist;
})();

// let SketchState = (function() {
//    let st = {};
//    st.SketchState = function(states, startIndices) {
//       this.states = states;
//       this.marker = (startIndices === undefined) ? {r : 0, c : 0} : startIndices; // ON SECOND THOUGHT, MIGHT USE FUNCTION NAMES INSTEAD
//       this.traverse
// 
//    };
//    return st;
// })();



