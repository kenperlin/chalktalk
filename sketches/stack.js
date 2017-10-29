function() {
   this.label = 'stack';

   function Stack(sketchCtx) {
      this.sketchCtx = sketchCtx;
      this.array = [];

      Stack.Item = function(sketchCtx, stack, value, scale) {
         this.sketchCtx = sketchCtx;
         this.stack = stack;
         const centerX = 0;
         const centerY = this.stack.size();
         scale = scale || 1;
         this.center = [centerX, centerY];
         this.value = value;
         this.scale = scale;
      };
      Stack.Item.prototype = {
         drawItem : function() {
            this.sketchCtx.drawItem(this.center, this.scale, this.value);
         }
      };

      this.array.push(new Stack.Item(this.sketchCtx, this, undefined));
   };


   this.drawItem = function(center, scale, value) {
      const left = center[0] - scale;
      const right = center[0] + scale;
      const bottom = center[1] - scale / 2;
      const top = center[1] + scale / 2;
      
      mLine([left,bottom],[right,bottom]);
      mLine([left,bottom],[left, top]);
      mLine([right, bottom],[right,top]);
      mLine([left,top],[right,top]);

      if (value === undefined) {
         return;
      }
      
      textHeight(this.mScale(.3));
      mText(value, center, .5, .5, .5);
   };


   Stack.prototype = {
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
         const status = this.operationMemory.operation();
         if (status.done) {
            this.operationMemory.active = false;
            this.operationMemory.operation = null;
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

      push : function(input, doAnimation = true) {
         if (!doAnimation) {
            this._pushNoAnimation(input);
            return;
         }
         const self = this;
         if (!this.operationMemory.active) {
            this.operationMemory.operation = (function() {
               const op = self._push(input);

               return function(args) { return op.next(args); };

            }());
            this.operationMemory.active = true;
         }
      },
      _push : function*(input) {
         if (input instanceof Array) {
            for (let item of input) {
               this.array.push(new Stack.Item(this.sketchCtx, this, this, item));
            }
         }
         else {
            this.array.push(new Stack.Item(this.sketchCtx, this, input));
         }
      },
      _pushNoAnimation : function(input) {
         if (input instanceof Array) {
            for (let item of input) {
               this.array.push(new Stack.Item(this.sketchCtx, this, item));
            }
         }
         else {
            this.array.push(new Stack.Item(this.sketchCtx, this, input));
         }        
      },

      pop : function() {
         if (this.size() == 0) {
            return;
         }
         return this.array.pop();
      },

      draw : function() {
         this.array.forEach(function(item) {
            item.drawItem();
         })
      },
      size : function() {
         return this.array.length - 1;
      },
      emptyStack : function() {
         while (this.array.length !== 0) {
            this.array.pop();
         }
      }
   };

   this.setup = function() {
      this.stack = new Stack(this);
      for (let i = 0; i < 5; i++) {
         this.stack.push(i + 1, false);
      }
   };

   this.under = function(other) {
      if (other.output === undefined) {
         return;
      }

      let out = other.output();
      out = Number(1 * out);

      this.stack.push(out)

      other.fade();
      other.delete();

   };

   this.isClickInsideStack = function(p){
      let size = this.stack.size();
      let scale = 1; // Temp
      let xOffset = scale;
      let yOffset = scale / 2;
      let left = -scale;
      let right = scale;
      // ORIGIN OF STACK IS AT (0, scale / 2)
      let top = size * scale - scale / 2;
      let bottom = 0 - scale / 2;

      return p.x > left && p.x < right && 
             p.y < top && p.y > bottom;
   };


   this.onPress = function(p) {
      if (this.sketchIsAcceptingInput() && 
          this.isClickInsideStack(p)) {
          this.stack.pop();
      }
   };

   this.sketchIsAcceptingInput = function() {
      return this.stack.isAcceptingInput;
   };

   this.render = function() {
      this.duringSketch(function() {
        mDrawOval([-1, -1], [1, 1], 32, 0, -PI);
      }); 
      this.afterSketch(function() {
         this.stack.doPendingOperation();
         if (this.sketchIsAcceptingInput() && 
            this.inValue[0] !== undefined) {
            this.stack.emptyStack();
            this.stack.push(this.inValue[0]);
         }
         this.stack.draw();
      });
   };
}
