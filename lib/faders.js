"use strict";

// SUPPORT FOR SWITCHABLE "FADER" VALUES THAT VARY CONTINUOUSLY OVER TIME BETWEEN 0.0 AND 1.1.

function Fader() {
   this._rate  = 1;
   this._state = false;
   this._value = 0;
}

Fader.prototype = {
   copy : function(src) {
      this._rate = src._rate;
      this._state = src._state;
      this._value = src._value;
      return this;
   },
   flip : function() {
      this._state = ! this._state;
   },
   rate : function(rate) {
      return this._rate = def(rate, this._rate);
   },
   state : function(state) {
      return this._state = def(state, this._state);
   },
   value : function() {
      return sCurve(this._value);
   },
   _update : function(elapsed) {
      this._value = this._state ? min(1, this._value + this._rate * elapsed)
                                : max(0, this._value - this._rate * elapsed);
   },
}

function Faders() {
   this._faders = {};
}

Faders.prototype = {
   clear : function() {
      this._faders = {};
   },
   copy : function(src) {
      this.clear();
      for (var id in src._faders)
         this.fader(id).copy(src.fader(id));
      return this;
   },
   fader : function(id) {
      if (this._faders[id] === undefined)
         this._faders[id] = new Fader();
      return this._faders[id];
   },
   update : function(elapsed) {
      for (var id in this._faders)
         this.fader(id)._update(elapsed);
   },
}

