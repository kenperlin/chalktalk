function() {
   this.USES_DEPRECATED_PORT_SYSTEM = true;
   /*
      Multiply a number, vector or matrix by a number, vector or matrix.
   */
   this.label = "Mult";
   this.render = function() {
      mLine( [-1, 1], [ 1, -1] );
      mLine( [ 1, 1], [-1, -1] );
      if (isDef(this.inLinks[0]) && isDef(this.inLinks[1]))
         this.outValue_DEPRECATED_PORT_SYSTEM[0] = mult(this.inValue_DEPRECATED_PORT_SYSTEM[0], this.inValue_DEPRECATED_PORT_SYSTEM[1]);
   }
}
