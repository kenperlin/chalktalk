function() {

function sum(x,y) {
   function pad(v) {
      var dst = [];
      for (var i = 0 ; i < 4 ; i++)
         dst.push(i < v.length ? v[i] : i<3 ? 0 : 1);
      return dst;
   }
   var dst = 0;
   var xIsArray = Array.isArray(x);
   var yIsArray = Array.isArray(y);
   if (! xIsArray && ! yIsArray) {
      dst = x + y;
   }
   else if (xIsArray && ! yIsArray) {
      var dst = [];
      for (var i = 0 ; i < x.length ; i++)
         dst.push(x[i] + y);
   }
   else if (! xIsArray && yIsArray) {
      var dst = [];
      for (var i = 0 ; i < y.length ; i++)
         dst.push(x + y[i]);
   }
   else {
      var nx = x.length;
      var ny = y.length;
      var dst = [];
      for (var i = 0 ; i < max(nx, ny) ; i++)
         dst.push((i < nx ? x[n] : 0) + (i < ny ? y[n] : 0));
   }
   return dst;
}
   this.label = "Sum";
   this.code = [["","sum(x,y)"]];
   this.render = function() {
      mLine( [ 0, 1], [ 0, -1] );
      mLine( [-1, 0], [ 1,  0] );

      if (isDef(this.in[0]) && isDef(this.in[1])) {
         this.outValue[0] = sum(this.inValue[0], this.inValue[1]);
      }
   }
}
