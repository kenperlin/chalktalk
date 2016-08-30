function() {
   var self = this;
   this.label = 'soundfile';
   window.soundfile = this;

   this.soundBuffer = null;
   this.soundBufferChannelData = null;

   this.tToSample = function(time) {
      var index = Math.round( (time * this.soundBuffer.sampleRate ) % this.soundBuffer.length );
      var sample = this.soundBufferChannelData[index];
      return sample;
   };

   this.createCodeFunction = function() {
      if (this.soundBuffer) {
         var codeText = 'return ( window.soundfile.tToSample(t) )';
         this.codeFunction = new Function('t', codeText);
      } else {
         this.codeFunction = new Function('t', 'return t');
      }
   };

   this.render = function(elapsed) {

      // Draw a clockwise circle, then inscribe a right-facing arrow head.

      mDrawOval([-1, -1], [1, 1], 32, PI/2, PI/2 - TAU);
      mCurve([[-.3, .5], [.5, 0], [-.3, -.5]]);

      this.input = document.getElementById('soundfileinput');

      this.createCodeFunction();
      this.setOutPortValue( self.codeFunction );

      this.onClick = function(e) {
         var self = this;
         this.input.click();
         this.input.addEventListener('change', handleFileSelect, false);
      };

      // Handle File Selection and asynchronous audio buffer decoding:

      var handleFileSelect = function(e) {
         var file = e.target.files[0];
         if (file && file.type && file.type.indexOf('audio') === -1) {
            console.log('Error: not a valid audio file');
            return;
         }

         self.reader = new FileReader();
         self.reader.addEventListener('load', self.loadSoundSuccess);
         self.reader.addEventListener('error', self.loadSoundError);
         self.reader.readAsArrayBuffer(file);

         this.removeEventListener('change', handleFileSelect);
      };

      this.loadSoundSuccess = function(s) {
         var arrayBuffer = s.target.result;
         self.decodeArrayBuffer(arrayBuffer);

         // Remove event listeners and clear the FileReader.

         try{
            self.reader.removeEventListener('load', self.loadSoundSuccess);
            self.reader.removeEventListener('error', self.loadSoundError);
            self.reader = undefined;
         } catch(e){};
      };

      this.loadSoundError = function(e) {
         console.log('Error decoding audio: ' + e.message);

         // Remove event listeners and clear the FileReader.

         try{
            self.reader.removeEventListener('load', self.loadSoundSuccess);
            self.reader.removeEventListener('error', self.loadSoundError);
            self.reader = undefined;
         } catch(e){};
      };

      this.decodeArrayBuffer = function(arrayBuffer) {
         audioContext.decodeAudioData(arrayBuffer,
            function(audioBuffer) {
               self.soundBuffer = audioBuffer;

               // Get first channel data (assume it's mono).

               self.soundBufferChannelData = audioBuffer.getChannelData(0);

               self.createCodeFunction();
               self.setOutPortValue( self.codeFunction );
            },
            function(error) {
               console.log('Error decoding audio: ' + error.message);
            }
         );
      };
   }
}
