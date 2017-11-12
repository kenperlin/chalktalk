function() {
   this.label = "ptrtest";
   function Pointee(sc, pIn, pOut) {
      this._ptrInPos = pIn;
      this._ptrOutPos = pOut;
      this.getPtrInPos = function() {
         return this._ptrInPos;
      };
      this.setPtrInPos = function(p) {
         this._ptrInPos = p;
      }
      this.getPtrOutPos = function() {
         return this._ptrOutPos;
      }
      this.setPtrOutPos = function(p) {
         this._ptrOutPos = p;
      }
      this.child = VisualPointer.createPtr(sc, this, null);
   }
   Pointee.prototype = {
      ptrOutPos : [0, 0, 0],
      ptrInPos : [1, 1, 0],
      draw : function() {
         m.save();
            m.translate(this._ptrOutPos);
            m.scale(0.25);
            mDrawOval([-1, -1], [1, 1], 32, PI / 2 - TAU);
         m.restore();
         this.child.draw();
      }
   }

   this.setup = function() {
      this.pointees = [
         new Pointee(this, [-1, 1, 0], [-1, 1, 0]),
         new Pointee(this, [1, -1, 0], [1, -1, 0]),
         new Pointee(this, [1, 1, 0], [1, 1, 0])
      ];

      this.testState = 0;
   };

   const numCases = 3;

   this.render = function(elapsedTime) {

      this.duringSketch(function() {
         // TEMP
         mLine([-1, 0], [1, 0]);
         mCurve([[0.75, -0.25], [1, 0], [0.75, 0.25]]);
      });


      this.afterSketch(function() {



         const i = this.pointees[1].getPtrInPos();
         const n = [sin(time), i[1] , i[2]];
         this.pointees[1].setPtrInPos(n);
         this.pointees[1].setPtrOutPos(n);

         switch (this.testState) {
         case 0:
            break;
         case 1:
            break;
         case 2:
            break;
         }
         for (let i = 0; i < this.pointees.length; i++) {
            this.pointees[i].draw();
         }
      });
   };

   this.onSwipe = [

   ];


   this.onPress = function(p) {
      switch (this.testState) {
      case 0:
         this.pointees[0].child.pointee = this.pointees[1];
         break;
      case 1:
         this.pointees[1].child.pointee = this.pointees[2];
         break;
      case 2:
         for (let i = 0; i < this.pointees.length; i++) {
            this.pointees[i].child.pointee = this.pointees[i];
         }        
         break;
      }
      this.testState = (this.testState + 1) % numCases;


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
