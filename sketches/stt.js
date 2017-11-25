function() {

   this.label = "stt";

   this.setup = function() {
   
   };
   this.text = "";
   this.isWink = false;

   this.isRotating = false;
   this.lastAngle = 0;

   this.render = function(elapsedTime) {

      this.duringSketch(function() {
         mLine([0, 0], [0, 1]);
         mLine([0, 0], [0, -1]);
      });

      this.afterSketch(function() {
         if (this.isMouseOver || true) {
            if (stt.hasText()) {
               textHeight(this.mScale(0.1));
               this.text = stt.popText();
               if (this.text === "wink") {
                  this.isWink = true;
               }
               else if (this.text === "open your eyes") {
                  this.isWink = false;
               }
               else if (this.text === "rotate") {
                  this.isRotating = true;
               }
               else if (this.text === "stop") {
                  this.isRotating = false;
               }
            }
         }
         if (this.isRotating) {
            m.rotateZ(this.lastAngle + elapsedTime);
            this.lastAngle += elapsedTime;
         }
         else {
            m.rotateZ(this.lastAngle);
         }
         mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
         mDrawOval([-.6,-.6],[.6,.6],32,TAU*6/10,TAU*9/10);
         mDrawOval([-.2,-.2],[.8,.5],32,PI*.5,PI*.2);
         mDrawOval([ .5,.2],[ .3,.4],32,-PI,0);
         if (this.isWink)
            mDrawOval([-1,.2],[.3,.9],32,-PI*.6,-PI*.4);
         else {
            mDrawOval([-.8,-.2],[.2,.5],32,PI*.8,PI*.5);
            mDrawOval([-.5,.2],[-.3,.4],32,-PI,0);
         }

         //mText(this.text, [0,0,0]  ,.5,.5);
      });
   };
   
   this.output = function() {
   };

   this.onSwipe = [

   ];

   this.onPress = function(p) {

   };
   this.onDrag = function(p) {

   };
   this.onRelease = function(p) {

   };
   this.onMove = function(p) {
   };

   this.onCmdPress = function(p) {

   };
   this.onCmdDrag = function(p) {

   };
   this.onCmdRelease = function(p) {

   };

   this.mouseDown = function(x, y, z) {

   };
   this.mouseDrag = function(x, y, z) {

   };
   this.mouseUp = function(x, y, z) {

   };
   this.mouseMove = function(x, y, z) {
      
   };

   this.under = function(otherSketch) {

   };
   this.over = function(otherSketch) {

   };
   this.onIntersect = function(otherSketch) {

   };
}
