function() {
   this.label = 'cube';
   this.is3D = true;

   function s(i) { return i > 0 ? 1 : -1; }
   var v = [];
   for (var n = 0 ; n < 8 ; n++)
      v.push([s(n&1), s(n&2), s(n&4)]);

   var a = [0,2,4,6, 0,1,4,5, 0,1,2,3];
   var b = [1,3,5,7, 2,3,6,7, 4,5,6,7];

   this.render = function(elapsed) {
     this.duringSketch(function() {
         mClosedCurve([v[0],v[2],v[3],v[1]]);
      });
      this.afterSketch(function() {
         for (var n = 0 ; n < a.length ; n++)
            mLine(v[a[n]], v[b[n]]);
      });
   }
}
