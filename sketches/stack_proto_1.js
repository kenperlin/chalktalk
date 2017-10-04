function() {
   this.label = 'Stack';

   let ctx = this;
   function Stack() {
     this.size = 0;
     this.array = [];


     Stack.Item = function(value, centerY, centerX=0, scale = 1){
       this.center = [centerX, centerY];
       this.value = value;
       this.scale = scale;
     }
     Stack.Item.prototype = {
       drawItem: function() {
         let center = this.center;
         let scale = this.scale;
         let left = center[0] - scale;
         let right = center[0] + scale;
         let bottom = center[1] - scale/2;
         let top = center[1] + scale/2;
         mLine([left,bottom],[right,bottom]);
         mLine([left,bottom],[left, top]);
         mLine([right, bottom],[right,top]);
         mLine([left,top],[right,top]);
         textHeight(ctx.mScale(.4));
         mText(this.value, center, .5, .5, .5);
       }
     }

     this.push = function(item) {
       this.array.push(item);
       this.size += 1;
     }

     this.draw = function() {
      //  console.log(this.size);
      //  this.array.forEach(function(item){
      //    item.drawItem();
      //  })
       for (i=0;i<this.array.size;i++){
         this.array[i].drawItem();
       }
     }

     Stack.prototype = {
       push: function(item) {
         this.array.push(item);
         this.size += 1;
       },
       pop: function(){
         this.size -= 1;
         return this.array.pop();
       },
       draw: function(){
         this.array.forEach(function(item){
           item.drawItem();
         })
       },
     };
   }

   this.setup = function() {
     this.stack = new Stack();
     for (i=0;i<5;i++){
       this.stack.push(new Stack.Item(i+1,i));
     }
     this.stack.draw();
   }

   this.render = function() {
     this.duringSketch(function() {
       mDrawOval([-1,-1], [1,1], 32, 0, -PI);
     });
     this.afterSketch(function() {

     });
   }
}
