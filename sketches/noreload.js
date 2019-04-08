function() {

   // THIS IS A DEMO OF THE noReload OPTION.
   // SKETCH MEMBER testValue WILL NOT BE REDEFINED
   // EVEN WHEN THE USER RELOADS THIS SKETCH.

   this.label = 'noreload';
   this.testValue = 0;
   this.noReload('testValue');
   this.onDrag = ['test', p => this.testValue = p.x ];

   this.render = function() {
      mCurve([[-1,1],[-1,-1],[1,1],[1,-1]]);
      this.afterSketch(function() {
         let x = this.testValue;
         mLine([x,1],[x,-1]);
      });
   }
}

