function() {
   this.label = "midi";

   // Draw as a musical note.

   this.render = function() {
      mLine([0,1], [0,-.6]);
      mDrawOval([-.8,-1], [0,-.2], 32, 0, -TAU);
   }

   this.output = function() {
      var out = [];
      for (key in midi.downKeys) {
         out.push(midi.frequencyFromNoteNumber(key));

         // When use hits middle C, create a walking bird.

	 if (! this.isBird && key == 60) {
            addSketch(new bird_sketch());
	    finishSketch();
	    sk().choice.setState(2); // Start bird walking.
	    this.isBird = true;
	 }
      }
      return out.length > 0 ? out : 0;
   }
}

