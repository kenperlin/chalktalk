function() {
   /*
      Multiply a number, vector or matrix by a number, vector or matrix.
   */
   this.label = "Mult";
   this.render = function() {
      mLine( [-1, 1], [ 1, -1] );
      mLine( [ 1, 1], [-1, -1] );
      if (isDef(this.in[0]) && isDef(this.in[1]))
         this.outValue[0] = mult(this.inValue[0], this.inValue[1]);
   }
}
