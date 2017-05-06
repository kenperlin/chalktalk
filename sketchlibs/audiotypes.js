"use strict";

AT.defineType({
   typename: "AudioSample",
   init: function(sample) {
      if (isNaN(sample)) {
         throw new AT.ConstructionError("Attempted to create an AudioSample with "
            + "non-numerical input " + sample);
      }
      sample = +sample;
      this._set("value", sample);
   },
   toPrimitive: function() {
      return this.value;
   }
});

AT.defineConversion(AT.AudioSample, AT.Float, function(sample) {
   return new AT.Float(sample.value);
});
AT.defineConversionsViaIntermediary(AT.AudioSample, AT.Float, AT.String);

// TODO: is there any way to do this for ALL AT.Function(AT.Seconds, X) -> X?
AT.defineConversion(AT.Function(AT.Seconds, AT.AudioSample), AT.AudioSample, function(func) {
   return new AT.AudioSample(func.call(time));
});

// TODO: is there any way to do this for ALL AT.Function(AT.Seconds, X) where X -> String?
AT.defineConversionsViaIntermediary(
   AT.Function(AT.Seconds, AT.AudioSample),
   AT.AudioSample,
   AT.String);
