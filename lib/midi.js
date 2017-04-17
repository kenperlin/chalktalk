"use strict";

function Midi() {
   var midi = this;

   this._eventStream = [];
   this._startTime = (new Date()).getTime();

   if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(function(midiAccess) {
         var inputs = midiAccess.inputs.values();
         for (var input = inputs.next() ; input && ! input.done ; input = inputs.next())
            input.value.onmidimessage = midi.onmidimessage;
      }, function(e) {
         console.log("Something went wrong while requesting MIDI access: " + e);
      });
   } else {
      console.log("Warning: MIDI is unsupported in your browser.");
   }

   this.downKeys = {};

   this.clearEventStream = function() { this._eventStream = []; }
   this.getEventStream = function() { return this._eventStream; }

   this.onmidimessage = function(event) {
      var data = event.data;
      var cmd = data[0] >> 4;
      var channel = data[0] & 0xf;
      var type = data[0] & 0xf0;
      var note = data[1];
      var velocity = data[2];

      var time = Math.floor(64 * ((new Date()).getTime() - this._startTime) / 1000);
      midi._eventStream.push(time << 14 | note << 7 | velocity); // unit of time: 1/64 sec.

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

