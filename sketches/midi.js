function() {
   this.label = "midi";
   this.spring = new Spring();
   this.force = 0;
   this.adjustHeight = 1;
   this.angle = 0;
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

   this.mouseDown = function(x, y) {
      this.xx = x;
      this.yy = y;
      this.swingMode = 'none';

      if (!isDef(this.midi)) {
         if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(function(midi) {
               // MIDI success callback
               _this.midi = midi;
               var inputs = midi.inputs.values();
               for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                  input.value.onmidimessage = _this.onmidimessage;
               }
            }, function(e) {
               console.log("Something went wrong while requesting MIDI access: " + e);
            });
         } else {
            // MIDI error callback
            alert("Seems MIDI is unsupported in your browser.");
         }
      }
   }

   this.mouseDrag = function(x, y) {
      var dx = x - this.xx;
      var dy = y - this.yy;
      if (this.swingMode == 'none')
         if (dx * dx + dy * dy > 10 * 10)
            this.swingMode = dx * dx > dy * dy ? 'swing' : 'height';
         else
            return;

      switch (this.swingMode) {
      case 'swing':
         this.force = 10 * dx / height();
         break;
      case 'height':
         this.adjustHeight *= 1 + dy / height() / this.rodHeight;
         break;
      }
      this.xx = x;
      this.yy = y;
   }

   this.render = function(elapsed) {
      var hubWidth  = stretch('hub width' , 10 * S(0).width);
      var rodHeight = stretch('rod length', 10 * (S(2).y - S(1).ylo) / 4) * 4;
      var bobRadius = stretch('bob size'  , 10 * (S(2).width + S(2).height) / 4);

      this.rodHeight = rodHeight * this.adjustHeight;

      this.spring.setMass(this.rodHeight * bobRadius);
      this.spring.setForce(this.force);
      this.force *= 0.9;
      this.spring.update(elapsed);

      var N = 32;
      m.scale(.5 * this.size / 40);
      m.translate(0, 2 - this.rodHeight, 0);
      mCurve([[-.5 * hubWidth, this.rodHeight], [.5 * hubWidth, this.rodHeight]]);

      this.angle = this.spring.getPosition();
      if (isNaN(this.angle)) this.angle = 0;

      m.translate(0, this.rodHeight, 0);
      m.rotateZ(this.angle);
      m.translate(0, -this.rodHeight, 0);

      mCurve([[0, this.rodHeight], [0,bobRadius]]);
      mDrawOval([-bobRadius, -bobRadius], [bobRadius, bobRadius], N, PI/2, PI/2-TAU);
   }

   this.output = function() {
      return this.lastFrequency;
   }
}


