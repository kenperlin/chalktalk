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

      // RETURN THE XYZ COORDINATES AS A LEN-3 ARRAY
      this.xyz = function() {
         return [this.x, this.y, this.z];
      };
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
      let z = pos.z; // TODO Z COORDINATE?
      let w = dim.w;
      let h = dim.h;
      mCurve([
         [x, y], 
         [x, y - h], 
         [x + w, y - h], 
         [x + w, y],
         [x, y]
      ]);  
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

      // DRAW AT A SPECIFIC POSITION, OPTIONALLY WITH SPECIFIC DIMENSIONS (IGNORE THE BOUNDING RECTANGLE'S DATA FOR THIS DRAW)
      this.drawAt = function(pos, dim) {
         this.func(pos, (dim === undefined) ? this.dim : dim);
      }
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
         _g.save();
         color("violet");
         // DRAW POINTER BOUND IF EXISTS
         if (that.hasBound()) {
            let dim = new Dimension.Dimension(that.bound.dim.w, (structure === null) ? that.bound.dim.h : structure.bound.dim.h, that.bound.dim.d);
            that.bound.drawAt(boundPos, dim);
         }

         // FIND THE POINTER START AND POINTEE POSITIONS
         let posA = that.getPosFrom(that, structure, boundPos);
         let posB = that.getPosTo(that, structure);

         // posB.y += 1.2;

         // DRAW THE POINTER ARROW
         // NOTE, INSERT BETTER ARROW / CURVE PROCEDURE HERE GIVEN THE TWO POINTS
         mCurve([[posA.x, posA.y], [posB.x, posB.y]]);
         
         // DRAW EXIT CIRCLE
         m.save();
            const scale = 0.03;

            m.translate([posA.x, posA.y, posA.z]);
            m.scale(scale);

            mFillOval([-1, -1],[1, 1], 36, PI / 2, PI / 2 - TAU);
            //fillOval(-1, -1, 1, 1, 36, PI / 2, PI / 2 - TAU);
         m.restore();

         // DRAW THE ARROW AT THE TIP *NOTE, ROTATION OF ARROW CURRENTLY INCORRECT TODO
         let offX = 0.1;
         let offY = 0.05;
         
          m.save();
         //    m.translate([posB.x, posB.y, posB.z]);
         //    let rotPt = CT.normalize(posB.xyz());
         //    m.rotateZ(atan(rotPt[1], rotPt[0]));
         //    m.translate([-posB.x, -posB.y, -posB.z]);
             mCurve([[posB.x - offX, posB.y + offY], [posB.x, posB.y], [posB.x - offX, posB.y - offY]]);
          m.restore();
         
         // DRAW POINTER LABEL
         if (shouldDrawLabel) {
            textHeight(ctContext.mScale(.14));
            mText(that.name, [(posA.x + posB.x) / 2, (posA.y + posB.y) / 2], .5, -1.5);
         }

         _g.restore();

      }


   };
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
            let deferred = {};
            deferred.func = ptrI.draw;
            deferred.args = [this.container.ctContext, this, ptrBoundPos, true];

            this.container.enqueueDrawDeferred(deferred);

            // DRAWING IMMEDIATELY RESULTED IN A JITTERY LOOK SINCE THE "NEXT" NODES MIGHT MOVE IN THEIR UPDATE PROCEDURES, TODO ALTERNATE SOLUTION?
            // RESPONSE BY ME : TWO COMPLETE LOOPS IN UPDATE FUNCTIONS, FIRST OFFSETS, SECOND DRAWS, NOT GREATEST SOLUTION, BUT WORKS
            //ptrI.draw(this.container.ctContext, this, ptrBoundPos, true);
         }

         // DRAW THE PAYLOAD AS TEXT, TODO OR DEFINE A "PAYLOAD" OBJECT REPRESENTATION FOR SOMETHING FANCIER?
         textHeight(this.container.ctContext.mScale(.2));
         let p = [this.bound.pos.x + .5 + offsetX - (horizontalPayloadShift / 2), this.bound.pos.y - (this.bound.dim.h / 2) + offsetY];
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
      this.nodeBeginUpdate = this.head;

      // SOME ELEMENTS (POINTER LINKS FOR EXAMPLE) FULLY UPDATED ONLY AFTER EACH NODE HAS BEEN UPDATED,
      // SO FOR NOW IT IS NECESSARY TO DEFER DRAWING OF THOSE ELEMENTS TO A POINT AFTER THE INITIAL UPDATES
      this._deferredDrawQueue = [];
      this.enqueueDrawDeferred = function(item) {
         this._deferredDrawQueue.push(item);
      };
      this.drawDeferred = function() {
         for (let i = 0; i < this._deferredDrawQueue.length; i++) {
            let args = this._deferredDrawQueue[i].args;
            this._deferredDrawQueue[i].func(args[0], args[1], args[2], args[3]); // TODO: SHOULD MAKE ARGS AN OBJECT LATER
         }
         this._deferredDrawQueue = [];
      };

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
                        return new Location.Position(0 - .25, 0, pointer.pos.z);
                     },
                     "head",
                     new Bound.BoundRect(
                        Location.ObjectCenter(new Dimension.Dimension(.25, .5, 0)).minusEqualsArr([1, 1, 0]),
                        new Dimension.Dimension(.25, .5, 0),
                        Bound.drawRect
                     ),
                     new Location.Position(-1, -1, 0)
         );

         h.draw = function() {
            h.ptr.draw(that.ctContext, that.head, h.ptr.bound.pos, true);
         };

         return h;
      })();


      this.insertFront = function(payload) {
         this.currOperation = LinkedList.SinglyLinked.Operation.INSERT_FRONT;

         let that = this;

         let defaultDims = LinkedList.SinglyLinkedNode.defaultDimension();

         let newNode = new LinkedList.SinglyLinkedNode(
            // POINTER TO THE CONTAINER (e.g. list)
            this,
            // PAYLOAD STORED
            payload,
            // BOUND FOR THE NODE
            new Bound.BoundRect(
               // RANDOMIZE DEFAULT POSITION OF NODE TO AVOID "STATIC LOOK"
               Location.ObjectCenter(defaultDims).plusEqualsArr(
                  [THREE.Math.randFloat(-.1, .1), THREE.Math.randFloat(-.4, .4), THREE.Math.randFloat(-.4, .4)]
               ),
               defaultDims,
               Bound.drawRect
            ),
            [
               // UNUSED-FOR-NOW DRAWABLE ELEMENTS ARRAY
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
                     return new Location.Position(pos.x + (that.HORIZONTAL_OFFSET * .8), /*pos.y - (pointer.bound.dim.h / 2)*/ 0, pos.z);
                  },
                  "next",
                  new Bound.BoundRect(
                     Location.ObjectCenter(defaultDims),
                     new Dimension.Dimension(.25, .5, 0),
                     Bound.drawRect
                  ),
                  new Location.Position(0.125, -0.25, 0)         
               ),
            ]
         );

         newNode.next = this.head;
         this.head = newNode;
         this.incSize();
      };

      this.removeFront = function() {
         this.currOperation = LinkedList.SinglyLinked.Operation.REMOVE_FRONT;
         if (this.size() <= 0) {
            return;
         }
         let toRemove = this.head;
         this.head = this.head.next;
         toRemove.next = null;
         this.decSize();
         return toRemove;
      };

      this._merge = function() {
         this.currOperation = "merge";
      }

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

         console.log("REVERSED");
      };

      // TODO STEP-THROUGH ALGORITHM
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
      
      // SEPARATE DRAW LOOP "STATES" POSSIBLY FOR USE WITH SMOOTHER ANIMATION / TRANSITIONS, "currOperation" CONTROLS WHICH SUB-ROUTINE TO RUN
      this.opQueue = [];
      this.HORIZONTAL_OFFSET = 2;
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

               that.headGraphic.draw();

               textHeight(that.ctContext.mScale(.2));
               _g.save();
               color("rgb(10, 40, 120)");
               mText("NULL", nullTailOffset.plusEqualsArr([that.HORIZONTAL_OFFSET, 0, 0]).xyz(), .5, .5);
               _g.restore();
               that.drawDeferred();
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

               that.headGraphic.draw();
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

               that.headGraphic.draw();
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

      // MAIN DRAW PROCEDURE FOR LIST
      this.draw = function() {
         this.states[this.state][this.currOperation](this);
      }

      // CONSOLE PRINT-OUT OF LIST
      this.print = function() {
         let strOut = "head->";
         let curr = this.head;
         while (curr !== null) {
            strOut += "[" + curr.payload + "]->";
            curr = curr.next;
         }
         strOut += "NULL";
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

   // THE FUTURE?
   linkedlist.DoublyLinked = function(ctContext) {
      this.ctContext = ctContext;
      this.head = null;
      this.tail = null;
      this._size = 0;

      this.currOperation = "NONE";
      this.nodeBeginUpdate = this.head;
   };

   return linkedlist;
})();



