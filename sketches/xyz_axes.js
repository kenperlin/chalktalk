function() {
   this.label = 'axes';
   this.is3D = true;
   this.mode = 0;

   this.drawing.add(new DRAWING.Curve([[-1,0],[1,0]]));
   this.drawing.add(new DRAWING.Curve([[0,-1],[0,1]]));

   this.onCmdClick = function() { this.mode++; }

   this.point = newVec3();
   this.pos = newVec3();
   this.rot = newVec3();

   this.onPress = function(point) { this.point.copy(point); }
   this.onDrag = function(point) {
      this.pos.add(point).sub(this.point);
      this.point.copy(point);
   }

   this.onCmdPress = function(point) { this.point.copy(point); }
   this.onCmdDrag = function(point) {
      this.rot.add(point).sub(this.point);
      this.point.copy(point);
   }

   var tmp = newVec3();
   this.render = function() {
      var otherColor = backgroundColor == 'black' ? 'cyan' : 'rgb(0,128,200)';
      this.afterSketch(function() {
         var e = pointToPixelMatrix.elements;
	 var showZ = tmp.set(e[8],e[9],e[10]).normalize().z < .975;
        
	 textHeight(this.mScale(.1));
	 mText("x=-1",[-1.2,0,0],.5,.5);
	 mText("x= 1",[ 1.2,0,0],.5,.5);
	 mText("y=-1",[0,-1.1,0],.5,.5);
	 mText("y= 1",[0, 1.1,0],.5,.5);
	 if (showZ) {
	    mText("z=-1",[0,0,-1.1],.5,.5);
	    mText("z= 1",[0,0, 1.1],.5,.5);
         }
	 lineWidth(1);
         mArrow([-1,0],[1,0], .1);
         mArrow([0,-1],[0,1], .1);
	 if (showZ)
            mArrow([0,0,-1],[0,0,1], .1);

         if (this.inValues.length >= 3) {
	    var V = this.inValues, x = V[0], y = V[1], z = V[2];
	    lineWidth(0.5);
	    mLine([x,0,0],[x,y,0]);
	    mLine([0,y,0],[x,y,0]);
	    mLine([x,0,0],[x,0,z]);
	    mLine([0,0,z],[x,0,z]);
	    mLine([0,y,0],[0,y,z]);
	    mLine([0,0,z],[0,y,z]);
	    mLine([0,y,z], V);
	    mLine([x,0,z], V);
	    mLine([x,y,0], V);
	    mDot(V, 0.2);
         }

	 switch (this.mode) {
	 case 1:
	    color(otherColor);
	    lineWidth(2);
	    m.translate(this.pos.x,this.pos.y,this.pos.z);
	    m.rotateX(this.rot.x);
	    m.rotateY(this.rot.y);
	    m.rotateZ(this.rot.z);
	    mArrow([0,0,0], [1,0,0]);
	    mArrow([0,0,0], [0,1,0]);
	    mArrow([0,0,0], [0,0,1]);
	    mDot([0,0,0],.25);
	    color(backgroundColor);
	    mDot([0,0,0],.23);
	    color(otherColor);
	    mText('x', [1.1,0,0],.5,.5);
	    mText('y', [0,1.1,0],.5,.5);
	    mText('z', [0,0,1.1],.5,.5);
	    mText('t', [0,0,0]  ,.5,.5);
	 }
      });
   }
}
