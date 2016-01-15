function() {
   this.label = 'ascii';
   this.render = function() {
      m.scale(1/16);
      m.translate(16, 3.2 * 3, 0);
      for (var i = 0 ; i < CT.lineFont.length ; i++) {
         if (i % 16 == 0)
	    m.translate(-32, -3.2, 0);
         CT.lineFont[i].forEach(mCurve);
         m.translate(2,0,0);
      }
   }
}
