"use strict";

let Pointer = (function() {
   let p = {};

   p.PointerGraphic = function(posFromFunc, posToFunc, name) {
      this.getPosFrom = posFromFunc;
      this.getPosTo = posToFunc;
      this.name = name;

      let that = this;

      this.draw = function(ctContext, structure) {

         let posA = that.getPosFrom(structure);
         let posB = that.getPosTo(structure);

         //function drawArrow() {
            mCurve([[posA.x, posA.y], [posB.x, posB.y]]);
            
            m.save();
            m.translate([posA.x, 0, 0]);
            m.scale(0.03);
            mDrawOval([-1, -1],[1, 1], 36, PI / 2, PI / 2 - TAU);
            //fillOval(-1, -1, 1, 1, 36, PI / 2, PI / 2 - TAU);

            m.restore();

            let offX = 0.1;
            let offY = 0.05;
            mCurve([[posB.x - offX, posB.y + offY], [posB.x, posB.y], [posB.x - offX, posB.y - offY]]);
            textHeight(ctContext.mScale(.14));
            mText(that.name, [(posA.x + posB.x) / 2, (posA.y + posB.y) / 2], .5, 0);
         //}

         //drawArrow();
      }
   };
   return p;
})();

let Orientation = (function() {
   let pos = {};
   pos.Position = function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = (z === undefined) ? 0 : z;

      this.plus = function(other) {
         return new Orientation.Position(
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
         );
      }

      this.minus = function(other) {
         return new Orientation.Position(
            this.x - other.x,
            this.y - other.y,
            this.z - other.z
         );
      }
   };

   return pos;

})();

let Bound = (function() {
   let shape = {};

   shape.drawBasicBox = function(x, y, w, h) {
      mCurve([
         [x, y], 
         [x, y - h], 
         [x + w, y - h], 
         [x + w, y],
         [x, y]
      ]);  
   }

   shape.BoundRect = function(relativePos, w, h, d, func) {
      this.pos = relativePos;
      this.w = w;
      this.h = h;
      this.d = (d === undefined) ? 0 : d;
      this.func = (func === undefined) ? Bound.drawBasicBox : func;

      this.draw = function(offsetX, offsetY, offsetZ, refObject) {
         let x = this.pos.x + offsetX;
         let y = this.pos.y + offsetY;
         let z = this.pos.z + offsetZ;
         this.func(x, y, this.w, this.h); // z coordinate to do
      };
   };

   // shape.BoundingSphere = function(centerPos, r) {
   //    this.pos = centerPos;
   //    this.r = r;
   //    this.draw = function() {
   //       mCurve([[], [], [], []]);
   //    };
   // };

   return shape;
})();

let DSNode = (function() {
   let node = {};

   node.Node = function(container, payload, bound, pointers, MODE) {
      this.container = container;
      this.payload = payload;
      this.bound = bound;
      this.pointers = pointers;

      // this.posSet = function(x, y) {
      //    let pos = this.bound.pos;
      //    pos.x = x;
      //    pos.y = y;
      // };
      this.posOffset = function(x, y, z) {
         let pos = this.bound.pos;
         pos.x += x;
         pos.y += y;
         if (z === undefined) {
            return;
         }
         pos.z += z;
      }
   };

   return node;
})();

let LinkedList = (function() {
   let linkedlist = {};

   linkedlist.SinglyLinkedNode = function(container, payload, bound, drawableElements, pointers, MODE) {
      DSNode.Node.call(this, container, payload, bound, pointers, MODE);
      this.drawableElements = drawableElements;
      this.next = null;

      // this.posSet = function(x, y) {
      //    let pos = this.bound.pos;
      //    pos.x = x;
      //    pos.y = y;

      //    pos = this.drawableElements[0].bound.pos;
      //    pos.x = x;
      //    pos.y = y;
      // };
      this.posOffset = function(x, y) {
         let pos = this.bound.pos;
         pos.x += x;
         pos.y += y;

         pos = this.drawableElements[0].pos;
         pos.x += x;
         pos.y += y;
      }

      this.draw = function(offsetX, offsetY) {
         this.bound.draw(offsetX, offsetY);
         this.drawableElements[0].draw(offsetX, offsetY, this);

         textHeight(this.container.ctContext.mScale(.2));
         mText(this.payload, [this.bound.pos.x + .5 + offsetX, this.bound.pos.y - (this.bound.h / 2) + offsetY], 0, 0);
         
         for (let i = 0; i < this.pointers.length; i++) {
            let deferred = {};
            deferred.func = this.pointers[i].draw;
            deferred.args = [this.container.ctContext, this];

            this.container.enqueueDrawDeferred(deferred);
            // this.pointers[i].draw(this.container.ctContext, this);
         }
      };
   };

   linkedlist.DoublyLinkedNode = function(container, payload, bound, drawableElements, pointers) {
      DSNode.Node.call(this, container, payload, bound, drawableElements, pointers);
      this.next = null;
      this.prev = null;
   };

   linkedlist.SinglyLinked = function(ctContext) {
      this.ctContext = ctContext;
      this.head = null;
      this.size = 0;

      this.currOperation = "NONE";

      this.operations = {

      };

      this._deferredDrawQueue = [];
      this.enqueueDrawDeferred = function(item) {
         this._deferredDrawQueue.push(item);
      };
      this.drawDeferred = function() {
         for (let i = 0; i < this._deferredDrawQueue.length; i++) {
            let args = this._deferredDrawQueue[i].args;
            this._deferredDrawQueue[i].func(args[0], args[1]);
         }
         this._deferredDrawQueue = [];
      };

      this.updateAllPositionsFmtA = function() {

      }

      this.updateAllPositionsFmtB = function() {
         
      }

      this.insertFront = function(payload) {
         this.currOperation = "insertFront";
         let outerBoxPos = new Orientation.Position(-1 + .5, .25, 0);
         let innerBoxPos = new Orientation.Position(-1 + .5 + .75, .25, 0);

         let ptrOutPos = new Orientation.Position(-1 + .5 + .75 + 0.125, 0, 0);

         let that = this;
         let currSize = this.getSize();

         let newNode = new LinkedList.SinglyLinkedNode(
            this,
            payload,
            new Bound.BoundRect(
               outerBoxPos, 
               1, 
               .5,
               0,
               Bound.drawBasicBox
            ),
            [
               new Bound.BoundRect(
                  innerBoxPos,
                  .25,
                  .5,
                  0,
               ),
            ],
            [
               new Pointer.PointerGraphic(
                  // pointer out
                  function(node) {
                     let pos = node.drawableElements[0].pos;
                     return new Orientation.Position(pos.x + 0.125, 0, 0);
                  },
                  // pointee
                  function(node) {
                     if (node.next !== null) {
                        let x = node.next.bound.pos.x;
                        let y = 0;
                        let pos = new Orientation.Position(x, y, 0);
                        return pos;
                     }

                     return new Orientation.Position(node.bound.pos.x + 2, 0, 0);
                  },
                  "next"
               ),
            ]
         );
         newNode.next = this.head;
         this.head = newNode;
         this.incSize();
      };

      this.removeFront = function() {
         this.currOperation = "removeFront";
         let toRemove = this.head;
         this.head = this.head.next;
         toRemove.next = null;
         this.decSize();
         return toRemove;
      };

      this.incSize = function() {
         this.size++;
      };

      this.decSize = function() {
         this.size--;
      };

      this.getSize = function() {
         return this.size;
      };

      this._setSize = function(newSize) {
         this.size = newSize;
      } 

      // ORIGINAL
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
         let j = listSave.length -1;
         while (i < j) {
            let swapPos = listSave[i].bound.pos;
            let swapPosIn = listSave[i].drawableElements[0].pos;

            listSave[i].bound.pos = listSave[j].bound.pos;
            listSave[i].drawableElements[0].pos = listSave[j].drawableElements[0].pos;

            listSave[j].bound.pos = swapPos;
            listSave[j].drawableElements[0].pos = swapPosIn;

            i++;
            j--;
         }
      };

      // STEP-THROUGH ALGORITHM
      this._reverseInPlace = Stepthrough.makeStepFunc(function*() {
         let curr = this.head;
         let prev = null;
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

      let that = this;
      this.state = "all";
      this.states = {
         "all" : function () {
                     let tempOffsetX = 0;
                     let tempOffsetY = 0;
                     let offsetX = 0;
                     let offsetY = 0;
                     let nullTailOffset = -2;
                     if (that.currOperation !== "NONE") {
                        if (that.currOperation === "insertFront") {
                           offsetX = 2;
                        }
                        else if (that.currOperation === "removeFront") {
                           offsetX = -2;
                        }
                     }

                     let curr = that.head;
                     if (curr !== null && that.currOperation !== "removeFront") {
                        curr.draw(tempOffsetX, tempOffsetY);
                        nullTailOffset = curr.bound.pos.x;
                        curr = curr.next;          
                     }
                     while (curr !== null) {
                        curr.posOffset(offsetX, offsetY);
                        curr.draw(tempOffsetX, tempOffsetY);
                        nullTailOffset = curr.bound.pos.x;
                        curr = curr.next;
                     }
                     textHeight(that.ctContext.mScale(.2));
                     mText("NULL", [nullTailOffset + 2, 0], 0, 0);
                     //textHeight(this.ctContext.mScale(1 / .5));

                     offsetX = 0;
                     offsetY = 0; 
                     that.currOperation = "NONE";     
                  },
      };

      this.draw = function() {
         this.states[this.state]();
      }

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

   linkedlist.DoublyLinked = function(ctContext) {
      this.ctContext = ctContext;
      this.head = null;
      this.tail = null;
      this.size = 0;
   };

   return linkedlist;
})();



