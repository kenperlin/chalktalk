function() {
   this.label = 'perspect';
   this.point = newVec3();
   this.dy = 0;
   this.onPress = function(point) { this.point.copy(point); }
   this.onDrag = function(point) {
      this.dy = max(-1,this.dy - (point.y - this.point.y));
      this.point.copy(point);
   }
   this.render = function() {
      var f = 1 / min(.999, max(.001, this.dy));
      m.perspective(0, f, 0);
      this.afterSketch(function() {
         if (time - this.startTime > 1) {
            lineWidth(.5 * min(1, time - this.startTime - 1));
            //color('cyan');
            color('blue');
            for (var x = -1 ; x <= 1 ; x += .2)
               mLine([x,-1],[x,1]);
            for (var y = -1 ; y <= 1 ; y += .2)
               mLine([-1,y],[1,y]);
         }
         mText(roundedString(-f), [0, -.5], .5, .5);
      });
      lineWidth(1);
      mLine([-1,0],[1,0]);
      mLine([0,-1],[0,1]);
      lineWidth(2);
      mClosedCurve([[-.25,.75],[.25,.75],[.25,1.25],[-.25,1.25]]);
   }
   this.startTime = time;
}
