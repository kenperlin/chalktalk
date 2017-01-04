"use strict";

function OutputPort(typename, outputFunc) {
   this.typename = typename;
   this.func = outputFunc;
   this._updateValue();
}

OutputPort.prototype._updateValue = function() {
   this.val = this.func();
}


function InputPort(typename) {
   this.typename = typename
   this.val = undefined
}

InputPort.prototype.hasValue = function() {
   return isDef(this.val);
}

InputPort.prototype._receiveValue = function(value) {
   if (!(value instanceof AT.Type)) {
      console.error("InputPorts should only receive Atypical types, received "
         + typeof(value) + " instead.")
   } 

   this.val = value.convert(this.typename);
   // TODO: some error checking?
}

InputPort.prototype._clear = function() {
   this.val = undefined;
}


function InputPortList() {
   this._inputs = []
}

InputPortList.prototype.hasValue = function(i) {
   return this.hasPort(i) && this.port(i).hasValue();
}

InputPortList.prototype.value = function(i) {
   return this.hasValue(i) ? this.port(i).val : undefined;
}

InputPortList.prototype.numPorts = function() {
   return this._inputs.length;
}

InputPortList.prototype.hasPort = function(i) {
   return this.numPorts() > i;
}

InputPortList.prototype.port = function(i) {
   return this._inputs[i];
}

InputPortList.prototype._addPort = function(port) {
   if (!(port instanceof InputPort)) {
      console.error("Attempted to add non-port object to InputPortList");
      return -1;
   }
   this._inputs.push(port);
   return this._inputs.length - 1;
}

InputPortList.prototype._clear = function() {
   for (var i = 0; i < this.numPorts(); i++) {
      this.port(i)._clear();
   }
}
