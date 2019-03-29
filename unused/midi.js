function() {
   this.label = "Midi";

   // Draw as a musical note.

   this.render = function() {
      mLine([0,1], [0,-.6]);
      mDrawOval([-.8,-1], [0,-.2], 32, 0, -TAU);
   }

   this.output = function() {
      var out = [];
      for (let key in midi.downKeys)
         out.push(midi.frequencyFromNoteNumber(key));
      return out.length > 0 ? out : 0;
   }
}

