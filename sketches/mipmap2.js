function() {
   this.label = 'mipmap2';
   this.is3D = true;
   this.mode = 0;
   this.onCmdClick = function() { this.mode++; }
   this.render = function() {
      m.rotateZ(-.05);
      m.rotateY(-PI*.1);
      m.rotateX(-PI*.4);
      mCurve([[-1,-1,-1],[1,-1,-1],[1,1,-1]]);
      mCurve([[1,1,-1],[-1,1,-1],[-1,-1,-1]]);
      if (this.mode > 0) {
         mClosedCurve([[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]);
         lineWidth(1);
         mLine([-1,0,1],[1,0,1]);
         mLine([0,-1,1],[0,1,1]);
         if (this.mode > 1) {
            var x = def(this.inValues[0]);
            var y = def(this.inValues[1]);
            var z = def(this.inValues[2]);
            mDot([x,y,-1],.1);
            mDot([x,y, 1],.1);
            mLine([x,y,-1],[x,y,1]);
            if (this.mode > 2)
               mDot([x,y,z],.2);
        }
      }
   }
}
