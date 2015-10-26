function() {
   this.label = "midi";
   this.midi;
   this.downKeys = {};
   this.lastFrequency = 0;

   var _this = this;

   this.onmidimessage = function(event) {
      var data = event.data;
      var cmd = data[0] >> 4;
      var channel = data[0] & 0xf;
      var type = data[0] & 0xf0;
      var note = data[1];
      var velocity = data[2];

      switch(type) {
         case 144:
            _this.noteOn(note, velocity);
            break;
         case 128:
            _this.noteOff(note, velocity);
            break;
      }
   }

   this.noteOn = function(note, velocity) {
      if (velocity == 0) {
         this.noteOff(note, velocity);
         return;
      }

      this.downKeys[note] = velocity;
      this.lastFrequency = this.frequencyFromNoteNumber(note);
   }

   this.noteOff = function(note, velocity) {
      delete this.downKeys[note];

      if (this.frequencyFromNoteNumber(note) == this.lastFrequency) {
         this.lastFrequency = 0;
      }
   }

   this.frequencyFromNoteNumber = function(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
   }

   this.render = function(elapsed) {
      mLine([0,1],[0,-.6]);
      mDrawOval([-.8,-1], [0,-.2], 32, 0, -TAU);

      this.afterSketch(function() {
         if (! isDef(this.midi)) {
            if (navigator.requestMIDIAccess) {
               navigator.requestMIDIAccess().then(function(midi) {
                  _this.midi = midi;
                  var inputs = midi.inputs.values();
                  for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                     input.value.onmidimessage = _this.onmidimessage;
                  }
               }, function(e) {
                  console.log("Something went wrong while requesting MIDI access: " + e);
               });
            } else {
               alert("Seems MIDI is unsupported in your browser.");
            }
         }
      });
   }

   this.output = function() {
      var out = [];
      for (key in this.downKeys)
         out.push(this.frequencyFromNoteNumber(key));
      return out.length > 0 ? out : 0;
   }
}

