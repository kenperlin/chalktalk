"use strict";

const CT_SpeechToText = (function() {
   let saved = null;

   let input = null;
   let timeoutId = null;
   let pauseTime = 500;

   let _stt = {};
   let isActive = false;

   _stt.popText = function() {
      let t = saved;
      saved = null;
      return t;
   };

   _stt.init = function() {
      const element = document.createElement("input");
      element.type = "text";
      element.id = "input";
      element.size = "1";
      element.value = "";
      element.autofocus = true;
      document.body.appendChild(element);

      input = document.getElementById("input");
   };

   _stt.isActive = function() { return isActive; };
   _stt.focus = function() { 
      if (!isActive) {
         return;
      }
      input.focus(); 
   };
   _stt.hasText = function() { return saved != null; }

   _stt.activate = function() {
      if (isActive) {
         return;
      }

      input.oninput = function() {
         if (timeoutId != null) {
            clearTimeout(timeoutId);
         }
         timeoutId = window.setTimeout(function() {
            const val = input.value;
            input.value = "";
            if (val.length != 0) {
               saved = val.trim().toLowerCase();
            }
            console.log("<" + saved + ">");

            timeoutId = null;
         }, pauseTime);
      }
      isActive = true;
   };

   _stt.deactivate = function() {
      if (!isActive) {
         return;
      }
      input.blur();
      saved = null;
      input.oninput = undefined;
      isActive = false;
   };

   return _stt;

}());

var stt = CT_SpeechToText;
