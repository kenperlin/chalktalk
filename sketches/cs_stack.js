function() {
   this.label = 'stack';

   let sketchCtx = this;

   function Stack(sketchCtx) {
      this.sketchCtx = sketchCtx;
      this.array = [];


      Stack.Item = function(value){
         let centerX = 0;
         let centerY = sketchCtx.stack.size();
         let scale = 1;
         this.center = [centerX, centerY];
         this.value = value;
         this.scale = scale;
      }
      Stack.Item.prototype = {
         drawItem: function() {
            sketchCtx.drawItem(this.center, this.scale, this.value);
        }
     }
   }


   this.drawItem = function(center, scale, value) {
      let left = center[0] - scale;
      let right = center[0] + scale;
      let bottom = center[1] - scale/2;
      let top = center[1] + scale/2;
      mLine([left,bottom],[right,bottom]);
      mLine([left,bottom],[left, top]);
      mLine([right, bottom],[right,top]);
      mLine([left,top],[right,top]);
      textHeight(this.mScale(.3));
      mText(value, center, .5, .5, .5);
   }


   Stack.prototype = {

      push: function(item) {
         let stackItem = new Stack.Item(item);
         this.array.push(stackItem);
      },
      pop: function(){
         return this.array.pop();
      },
      draw: function(){
         this.array.forEach(function(item){
            item.drawItem();
         })
      },
      size: function(){
         return this.array.length;
      },
      emptyStack: function() {
         while (this.array.length !== 0){
            this.array.pop();
         }
      }
   };

   this.setup = function() {
     this.stack = new Stack(this);
     for (i=0;i<5;i++){
       this.stack.push(i+1);
     }

   }

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
      let yOffset = scale/2;
      let left = -scale;
      let right = scale;
      // origin of stack is at (0,scale/2)
      let top = size * scale - scale/2;
      let bottom = 0 - scale/2;

      return p.x > left && p.x < right && p.y < top && p.y > bottom;
   }


   this.onPress = function(p) {
      if (this.isClickInsideStack(p)){
         this.stack.pop();
      }
   }

   this.render = function() {
     this.duringSketch(function() {
        mDrawOval([-1, -1], [1, 1], 32, PI, 0);
     });
     this.afterSketch(function() {
        mLine([-1, -0.5], [1, -0.5]);
        mLine([1, -0.5], [1, -1]);
        mLine([1, -1], [-1, -1]);
        mLine([-1, -1], [-1, -0.5]);
        if (this.inValue[0] !== undefined){
           sketchCtx.stack.emptyStack();
           this.inValue[0].forEach(function(item){
              sketchCtx.stack.push(item);
           })
           this.stack.draw();

        } else {
           this.stack.draw();
        }


     });
   }
}
