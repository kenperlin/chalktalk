"use strict";

let Speech = (function() {
   let Speech = {};

   Speech.say = function(words) {
      if (window.speechSynthesis) {
         let msg = new SpeechSynthesisUtterance(words);
         window.speechSynthesis.speak(msg);
      }
      else {
         console.warning("Attempted to make speech synthesis say \"" + words + "\", but synthesis "
            + "is not supported in this browser.");
      }
   }

   return Speech;
})();

