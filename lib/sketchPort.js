"use strict";

// Constructor for an output port for a sketch.
//
// typename: The name of the type of data that this port will output.
//           Must be a name of a type already defined in the Atypical type system.
// outputFunc: A function that, when called, returns the output value.
//             MUST return a value of the type corresponding to the string in the typename field.
function OutputPort(typename, outputFunc) {
   if (!AT.typeIsDefined(typename)) {
      console.error("The type used to define an output port, "
         + typename + ", has not been defined.");
      return;
   }

   this.typename = typename;
   this.func = outputFunc;

   // This variable is where you should usually get the value for this port from.
   // It's updated every tick and doesn't do any additional processing.
   this.val = undefined;
}

// Internal function. Calls the value-generating function and stores its value within this object.
OutputPort.prototype._updateValue = function() {
   this.val = this.func();
}


// Constructor for an input port for a sketch.
//
// typename: The name of the type of data that this port expects to receive.
//           Must be a name of a type already defined in the Atypical type system.
function InputPort(typename) {
   if (!AT.typeIsDefined(typename)) {
      console.error("The type used to define an input port, "
         + typename + ", has not been defined.");
      return;
   }

   this.acceptedTypes = [typename];

   // This variable is where you should usually get the value for this port from.
   // It's updated every tick via Chalktalk's link system.
   this.val = undefined
}

// Returns true if this port has received a value, false if not.
InputPort.prototype.hasValue = function() {
   return isDef(this.val);
}

// Adds another typename to the list of types this port is allowed to accept.
// Values are received as-is if they match any of the supported types of this port.
// If they do not match, they are converted to the first type where a conversion from the value's
// type exists.
//
// typename: The name of the type of data that this port expects to receive.
//           Must be a name of a type already defined in the Atypical type system.
InputPort.prototype.addAcceptedType = function(typename) {
   if (!AT.typeIsDefined(typename)) {
      console.error("Attempted to make an input port accept a type ("
         + typename + ") which has not been defined.");
      return;
   }
   this.acceptedTypes.push(typename);
}

// Internal function used to update the value for this input port. Also handles type conversion.
//
// value - The input value. Must be an Atypical type object.
// 
// Returns true if this port can successfully receive this value based on its type.
// (I.e. if it matches any of the supported types or can be converted to one of them.)
// Returns false if not.
InputPort.prototype._receiveValue = function(value) {
   if (!(value instanceof AT.Type)) {
      console.error("InputPorts should only receive Atypical types, received "
         + typeof(value) + " instead.")
      return false;
   } 

   // Check if we accept this type directly. If so, take it in.
   for (let i = 0; i < this.acceptedTypes.length; i++) {
      if (value.typename === this.acceptedTypes[i]) {
         this.val = value;
         return true;
      }
   }
   for (let i = 0; i < this.acceptedTypes.length; i++) {
      if (value.canConvert(this.acceptedTypes[i])) {
         this.val = value.convert(this.acceptedTypes[i]);
         return true;
      }
   }
   return false;
}

// Internal function used to clear the last received value from this port.
InputPort.prototype._clear = function() {
   this.val = undefined;
}


// Constructor for a set of input ports in one "smart" container, with many convenience functions
// for accessing values and data from all of them.
function InputPortList() {
   this._inputs = []
}

// Returns true if the port at index i exists and has received a value.
InputPortList.prototype.hasValue = function(i) {
   return this.hasPort(i) && this.port(i).hasValue();
}

// Gets the value for the port at index i. Returns undefined if there is no port i or if port i has
// not received a value.
InputPortList.prototype.value = function(i) {
   return this.hasValue(i) ? this.port(i).val : undefined;
}

// Returns the total number of ports in this collection.
InputPortList.prototype.numPorts = function() {
   return this._inputs.length;
}

// Returns true if this collection has a port at index i, false if not.
InputPortList.prototype.hasPort = function(i) {
   return this.numPorts() > i;
}

// Returns the port object at index i, undefined if it does not exist.
InputPortList.prototype.port = function(i) {
   return this._inputs[i];
}

// Internal function for adding a new port. You generally don't need to call this directly,
// as the Sketch function for defining an input will do it for you.
//
// port - The port to add to the list.
InputPortList.prototype._addPort = function(port) {
   if (!(port instanceof InputPort)) {
      console.error("Attempted to add non-port object to InputPortList");
      return -1;
   }
   this._inputs.push(port);
   return this._inputs.length - 1;
}

// Internal function. Clears all values from all ports in the collection.
InputPortList.prototype._clear = function() {
   for (var i = 0; i < this.numPorts(); i++) {
      this.port(i)._clear();
   }
}
