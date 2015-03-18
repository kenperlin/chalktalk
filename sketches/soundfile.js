function() {
  var self = this;
  this.label = 'soundfile';
  window.soundfile = this;

  this.soundBuffer = null;
  this.soundBufferChannelData = null;

  this.tToSample = function(time) {
    var index = Math.round( (time * this.soundBuffer.sampleRate ) % this.soundBuffer.length );
    var sample = this.soundBufferChannelData[index];
    console.log(sample);
    return sample;
  };

  this.createCodeFunction = function() {
    if (self.soundBuffer) {
      var codeText = 'console.log(window.soundfile.tToSample(t)); return ( tToSample(t) )';
      this.codeFunction = new Function('t', codeText);
    } else {
      this.codeFunction = new Function('t', 'return t');
    }
  };

  this.render = function(elapsed) {
    mCurve([[-1,1],[-0.25,0,],[-1,-1]]);
    mDrawOval([-1, -1], [1, 1]);
    this.input = document.getElementById('soundfileinput');
    this.createCodeFunction();
    this.setOutPortValue( self.codeFunction );

    this.afterSketch(function() {
      mCurve([[-1,1],[-.25,0,],[-1,-1]]);
      mDrawOval([-1, -1], [1, 1]);
    });

    this.mouseDown = function(e) {
      var self = this;
      if (this.soundBuffer === null) {
        this.input.click();
        this.input.addEventListener('change', handleFileSelect, false);
      }
    };


    // Handle File Selection and asynchronous audio buffer decoding -->

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

      // remove event listeners and clear the FileReader
      try{
        self.reader.removeEventListener('load', self.loadSoundSuccess);
        self.reader.removeEventListener('error', self.loadSoundError);
        self.reader = undefined;
      } catch(e){};
    };

    this.loadSoundError = function(e) {
      console.log('Error decoding audio: ' + e.message);

      // remove event listeners and clear the FileReader
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

          // get first channel data (assume it's mono)
          self.soundBufferChannelData = audioBuffer.getChannelData(0);

          self.createCodeFunction();
          self.setOutPortValue( self.codeFunction );

          console.log('Success loading audio buffer');
          console.log(self);
        },
        function(error) {
          console.log('Error decoding audio: ' + error.message);
        }
      );
    };

  }
}