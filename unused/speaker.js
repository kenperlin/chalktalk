function() {
   this.label = 'speaker';
   this.render = function() {
      var a = .3;
      mCurve([[1,-1],[-a,-a],[-1,-a],[-1,a],[-a,a],[1,1]]);
      mLine([1,1],[1,-1]);
      this.afterSketch(function() {
         if (typeof this.inValue[0] == 'function')
            setAudioSignal(this.inValue[0]);
         else
            setAudioSignal();
      });
   }

   this.onDelete = function() {
      setAudioSignal();
   }
}
