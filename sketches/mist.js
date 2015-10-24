function() {
   this.label = 'mist';

   this.startTime = time;

   var h =  0.8;
   var a =  0.3;
   var b = -0.25;
   var e =  0.23;
   var w = .95;
   var f = e * 4 / 5;

   function createPipe(path) {
      var curve = [];
      for (var i = 1 ; i < path.length ; i++) {
         var p0 = path[i-1];
         var p1 = path[i];
         curve = curve.concat( p0[0] == p1[0] || p0[1] == p1[1]
                               ? [p0, p1]
                               : createRoundCorner(p0, p1, path[i-2][0] != p0[0] ? 0 : 1) );
      }
      return curve;
   }

   function drawM() {
      for (var i = 0 ; i < 2 ; i++) {
         var path = [];
         path.push([-w    ,-h]);
         path.push([-w    , h - f]);
         path.push([-w+2*f, h + f]);
         path.push([  -2*f, h + f]);
         path.push([0     , h - f]);
         path.push([0     ,-h]);
         mCurve(createPipe(path));
         m.translate(w,0,0);
      }
   }

   this.render = function() {
      _g.lineCap = 'square';
      lineWidth(this.mScale(0.3));

      drawM();

      this.afterSketch(function() {
         lineWidth(this.mScale(0.3));

         m.translate(0.65,0,0);

         mFillCurve(createRoundRect(-1-e,h-e*.55,2*e,2*e,e/2));

         var path = [];
         path.push([-1,a]);
         path.push([-1,-h+e*3/2]);
         path.push([-1+e*3/2,-h]);
         path.push([.4-e,-h]);
         path.push([.4,-h+e]);
         path.push([.4,b-e]);
         path.push([.4-e,b]);
         path.push([-.4+e,b]);
         path.push([-.4,b+e]);
         path.push([-.4,a-e]);
         path.push([-.4+e,a]);
         path.push([1.35,a]);
         mCurve(createPipe(path));

         m.translate(0.95,0,0);

         var path = [];
         path.push([0,h-e/3]);
         path.push([0,-h+e*3/2]);
         path.push([e*3/2,-h]);
         path.push([.4,-h]);
         mCurve(createPipe(path));
      });
   }
}
