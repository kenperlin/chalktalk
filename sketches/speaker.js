function() {
   this.label = 'speaker';

   this.defineInput(AT.Function(AT.Seconds, AT.AudioSample));

   this.render = function() {
      var a = .3;
      mCurve([[1,-1],[-a,-a],[-1,-a],[-1,a],[-a,a],[1,1]]);
      mLine([1,1],[1,-1]);
      this.afterSketch(function() {
         if (this.inputs.hasValue(0))
            setAudioSignal(this.inputs.value(0));
         else
            setAudioSignal();
      });
   }

   this.onDelete = function() {
      setAudioSignal();
   }
}
