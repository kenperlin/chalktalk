function Midi() {
   var midi = this;

   if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(function(midiAccess) {
         var inputs = midiAccess.inputs.values();
         for (var input = inputs.next() ; input && ! input.done ; input = inputs.next())
            input.value.onmidimessage = midi.onmidimessage;
      }, function(e) {
         console.log("Something went wrong while requesting MIDI access: " + e);
      });
   } else {
      alert("Seems MIDI is unsupported in your browser.");
   }

   this.downKeys = {};

   this.onmidimessage = function(event) {
      var data = event.data;
      var cmd = data[0] >> 4;
      var channel = data[0] & 0xf;
      var type = data[0] & 0xf0;
      var note = data[1];
      var velocity = data[2];

      switch(type) {
         case 144:
            if (velocity > 0) {
               midi.downKeys[note] = velocity;
               break;
            }
         case 128:
            delete midi.downKeys[note];
            break;
      }
   }

   this.frequencyFromNoteNumber = function(note) {
      return 440 * Math.pow(2, (note - 69) / 12);
   }
}

