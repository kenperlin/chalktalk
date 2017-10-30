function() {

   this.label = "CURSORBUG";

   this.setup = function() {
      this.onCurves = [];
      this.mouseCurves = [];   
   };

   this.render = function(elapsedTime) {

      this.duringSketch(function() {
         mLine([-1, 1], [1, -1]);
         mLine([-1, -1], [1, 1]);      
      });

      this.afterSketch(function() {
		 lineWidth(1);
         mLine([-1, 1], [1, 1]);
         mLine([-1, -1], [1, -1]);

		 // RED IS ON_X VARIANT
		 if (this.onCurves.length > 0) {
			console.log("ON_: " + this.onCurves.length);
            color("orange");
            mCurve(this.onCurves);
		 }
		 // CYAN IS mouse_X VARIANT
		 if (this.mouseCurves.length > 0) {
			console.log("MOUSE_: " + this.mouseCurves.length);
            color("cyan");
            mCurve(this.mouseCurves);
		 }
		 
		 this.doPending();
      });
   };

   this.onPress = function(p) {
      console.log("ON_PRESS");
	  this.onDrag(p);
   };
   this.onDrag = function(p) {
      console.log("ON_DRAG");
	  this.onCurves.push([p.x, p.y]);
   };
   this.onRelease = function(p) {
      console.log("ON_RELEASE");
	  const self = this;
	  // ADD DELAY SINCE NON-COMMAND VERSION SEEMS FINE
	  this.pending = (function() {
		 const timeStart = time;
		 const duration = 0.2;
	     return function() {
		    if (time - timeStart >= duration) {
			   self.onCurves = [];
			   self.pending = null;
			}
		 };
	  }());
   };
   this.onMove = function(p) {
	   // console.log("ON_MOVE");
   };

   // ON_CMD_X DRIFTS,
   // SEEMS TO WORSEN IF SKETCH INITIALLY DRAWN LARGE,
   // INDEPENDENT OF SUBSEQUENT SCALING (i.e. WITH 's' KEY)
   this.onCmdPress = function(p) {
      console.log("ON_CMD_PRESS");
      this.onCmdDrag(p);
   };
   this.onCmdDrag = function(p) {
      console.log("ON_CMD_DRAG");
      this.onCurves.push([p.x, p.y]);
   };
   this.onCmdRelease = function(p) {
      console.log("ON_CMD_RELEASE");
	  this.onCurves = [];
   };
   // onCmdMove DOESN'T EXIST
   this.onCmdMove = function(p) {
	   console.log("ON_CMD_MOVE");	   
   };

   this.mouseDown = function(x, y, z) {
      console.log("MOUSE_DOWN");
      this.mouseDrag(x, y, z);
   };
   this.mouseDrag = function(x, y, z) {
      console.log("MOUSE_DRAG");
      this.mouseCurves.push(this.inverseTransform([x, y, 0]));
   };
   this.mouseUp = function(x, y, z) {
      console.log("MOUSE_UP");
	  this.mouseCurves = [];
   };
   this.mouseMove = function(x, y, z) {
      //console.log("MOUSE_MOVE");
   };
   
   this.pending = null;
   this.doPending = function() {
      if (this.pending == null) {
	     return;
	  }
	  this.pending();
   }
}
