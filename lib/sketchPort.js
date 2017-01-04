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

   this.val = value.convert(value.typename);
   // TODO: some error checking?
}


function InputPortList() {
   this.inputs = []
}

InputPortList.prototype.hasValue = function(i) {
   return this.hasPort(i) && this.port(i).hasValue();
}

InputPortList.prototype.value = function(i) {
   return this.hasValue(i) ? this.port(i).val : undefined;
}

InputPortList.prototype.hasPort = function(i) {
   return this.inputs.length > i;
}

InputPortList.prototype.port = function(i) {
   return this.inputs[i];
}

InputPortList.prototype._addPort = function(port) {
   if (!(port instanceof InputPort)) {
      console.error("Attempted to add non-port object to InputPortList");
      return -1;
   }
   this.inputs.push(port);
   return this.inputs.length - 1;
}
