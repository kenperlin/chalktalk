function() {
   this.label = 'face';
   this.is3D = true;
   this.render = function() {
      function p(x,y) { return [x, y, sqrt(1 - x*x - y*y)]; }
      m.scale(.8,1,.8);
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      var a = 0, b = 0, c = 0;
      this.afterSketch(function() {
         a = sin(    time);
         b = sin(2 * time);
      });
      m.rotateY(noise(time));
      m.rotateX(noise(time + 10) * .5);
      var dy = .025 * a;
      mSpline([p(-.6, .2+dy), p(-.4, .2-dy), p(-.2, .2+dy)]);
      mSpline([p( .2, .2+dy), p( .4, .2-dy), p( .6, .2+dy)]);
      var dy = .05 * b;
      mSpline([p(-.3,-.5+dy), p(  0,-.5-dy), p( .3,-.5+dy)]);
      this.afterSketch(function() {
      });
   }
}
