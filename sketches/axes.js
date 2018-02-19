function() {
/*
   to do:  add x', y', z', text labels to rotated RGB axes.
*/
   this.label = 'Axes';
   this.is3D = true;
   this.mode = 0;

   this.onCmdClick = function() { this.mode = (this.mode + 1) % 2; }

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
      mLine([-1,0], [1,0]);
      mLine([0,-1], [0,1]);
      var otherColor = isBlackBackground() ? 'cyan' : 'rgb(0,128,200)';
      this.afterSketch(function() {
         var e = this.pointToPixelMatrix.elements;
         var showZ = tmp.set(e[8],e[9],e[10]).normalize().z < .975;
         var c, i, V, x, y, z, inValue, edges;
        
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

         // HANDLE THE CASES WHERE THERE IS INPUT DATA.

         if (isDef(this.inValue[0])) {
            let inValue = this.inValue[0];

            // INPUT VALUE IS A MATRIX

            if (inValue.length == 16 && isNumeric(inValue[0])) {
	       let M = inValue;
	       m.save();
	       m.translate(M[12], M[13], M[14]);
	       let lw = lineWidth();
	       lineWidth(4);
	       color('red'  ); mArrow([0,0,0], [M[0],M[1],M[2]]);
	       color('green'); mArrow([0,0,0], [M[4],M[5],M[6]]);
	       color('blue' ); mArrow([0,0,0], [M[8],M[9],M[10]]);
	       lineWidth(lw);
	       m.restore();
            }

            // INPUT VALUE IS A VECTOR

            else if (arrayDepth(inValue) == 1) {

               V = inValue; x = V[0]; y = V[1]; z = def(V[2]);
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
               lineWidth(4);
               mLine([x-.01,y,z], [x+.01,y,z]);
               mLine([x,y-.01,z], [x,y+.01,z]);
               mLine([x,y,z-.01], [x,y,z+.01]);
               mFillDisk(V, 0.05);
            }

            else if (arrayDepth(inValue) == 2) {

               if (inValue.color)
                  color(inValue.color);
               m.scale(.5,.5,.5);
               if (inValue && inValue.fillMode > 0) {
                  if (inValue.fillMode == 1) {
                     color(fadedColor(0.25, parseRGBA(c = _g.strokeStyle)));
                     m.translate(0,0,-.001);
                     mFillCurve(inValue);
                     m.translate(0,0,.001);
                     color(c);
                  }
                  else
                     mFillCurve(inValue);
               }
               if (edges = inValue.edges)
                  for (i = 0 ; i < edges.length ; i++)
                     mLine(inValue[edges[i][0]], inValue[edges[i][1]]);
               else
                  for (i = 0 ; i < inValue.length ; i++)
                     mDot(inValue[i], 0.1);
            }
         }

         if (this.mode > 0) {
            m.save();

               color(otherColor);
               lineWidth(this.mode == 1 ? 2 : 1);
               m.translate(this.pos.x,this.pos.y,this.pos.z);
               m.rotateX(this.rot.x);
               m.rotateY(this.rot.y);
               m.rotateZ(this.rot.z);

               lineWidth(4);
               color('green');
               mArrow([0,0,0],[0,1,0]);
               color('blue');
               mArrow([0,0,0],[0,0,1]);
               color('red');
               mArrow([0,0,0],[1,0,0]);

               mDot([0,0,0],.25);
               color(backgroundColor);
               mDot([0,0,0],.23);
               color(otherColor);
               mText('x\'', [1.1,0,0],.5,.5);
               mText('y\'', [0,1.1,0],.5,.5);
               mText('z\'', [0,0,1.1],.5,.5);
               mText('t\'', [0,0,0]  ,.5,.5);

            m.restore();
         }
      });
   }
}
