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


AT.defineType({
   typename: "Hertz",
   init: function(hz) {
      if (hz === undefined) {
         hz = 0;
      }
      if (isNaN(hz)) {
         throw new AT.ConstructionError("Attempted to create a Hertz with "
            + "non-numerical input " + hz);
      }
      hz = +hz;
      this._set("value", hz);
   },
   toPrimitive: function() {
      return this.value;
   }
});

AT.defineConversion(AT.Hertz, AT.Float, function(hz) { return new AT.Float(hz.value); });
AT.defineConversion(AT.Float, AT.Hertz, function(f) { return new AT.Hertz(f.value); });

AT.defineConversion(AT.Hertz, AT.String, function(hz) {
   return new AT.String(hz.value.toFixed(0) + " Hz");
});
AT.defineConversionsViaIntermediary(AT.String, AT.Float, AT.Hertz);

AT.defineConversionsViaIntermediary(null, AT.Float, AT.Hertz);
AT.defineConversionsViaIntermediary(AT.Hertz, AT.Float, null);
AT.defineConversionsViaIntermediary(AT.Float, AT.Hertz, null);
AT.defineConversionsViaIntermediary(null, AT.Hertz, AT.Float);

// TODO: is there any way to do this for ALL AT.Array(AT.X) where X -> String?
AT.defineConversion(AT.Array(AT.Hertz), AT.String, function(arr) {
   return new AT.String("[" + arr.values.map(function(val) {
         return val.convert(AT.String).value;
      }).join(", ") + "]"
   );
});

AT.defineConversion(AT.Hertz, AT.Function(AT.Seconds, AT.AudioSample), function(hz) {
   return new (AT.Function(AT.Seconds, AT.AudioSample))(function (seconds) {
      return Math.sin(hz.value*seconds*2*Math.PI);
   });
});
