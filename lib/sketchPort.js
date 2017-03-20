"use strict";

// Constructor for an output port for a sketch.
//
// type: The constructor of the type of data that this port will output. Must be a type already
//       defined in the Atypical type system.
// outputFunc: A function that, when called, returns the output value.
//             MUST return a value of the type corresponding to the string in the typename field,
//             or, in the case that the type is a primitive type, a regular Javascript value that
//             can be converted to the type (i.e. accepted in its init function/constructor).
function OutputPort(type, outputFunc) {
   if (typeof type !== "function" || !AT.typeIsDefined(type)) {
      console.error("The type used to define an output port, "
         + type.name + ", has not been defined.");
      return;
   }

   this.type = type;
   this.func = outputFunc;

   // This variable is where you should usually get the value for this port from.
   // It's updated every tick and doesn't do any additional processing.
   this.val = undefined;
}

// Internal function. Calls the value-generating function and stores its value within this object.
OutputPort.prototype._updateValue = function() {
   if (AT.isPrimitive(this.type)) {
      this.val = this._getWrappedValue();
   }
   else {
      this.val = this.func();
   }
}

// Internal function for auto-wrapping values. Meant to be used only on primitive types.
OutputPort.prototype._getWrappedValue = function() {
   let v = this.func();
   if (v instanceof this.type) {
      return v;
   }
   else {
      return new this.type(v);
   }
}


// Constructor for an input port for a sketch.
//
// typename: The name of the type of data that this port expects to receive.
//           Must be a name of a type already defined in the Atypical type system.
// preprocessingFunction: An optional function of one argument that gets called every time this
//                        port receives a value. If defined, this.val gets the result of calling 
//                        this function on the input value instead of the raw input value.
function InputPort(typename, preprocessingFunction) {
   if (!AT.typeIsDefined(typename)) {
      console.error("The type used to define an input port, "
         + typename + ", has not been defined.");
      return;
   }

   if (isDef(preprocessingFunction)) {
      if (typeof(preprocessingFunction) !== "function") {
         console.error("Error creating input port, expecting function as preprocessing function, "
            + "got " + typeof(preprocessingFunction));
         return;
      }
      if (preprocessingFunction.length !== 1) {
         console.error("Error creating input port, the preprocessing function must have "
            + "exactly one argument (has " + preprocessingFunction.length + ")");
         return;
      }
   }
   else if (AT.isPrimitive(typename)) {
      // Create a default preprocessing function for primitive types.
      preprocessingFunction = function(x) { return x.toPrimitive(); };
   }

   this.acceptedTypes = [typename];
   this.preprocessingFunctions = {};
   this.preprocessingFunctions[typename] = preprocessingFunction;

   // This variable is where you should usually get the value for this port from.
   // It's updated every tick via Chalktalk's link system, passed through the preprocessing
   // function first (if defined).
   this.val = undefined
   // This variable gives you the raw value from before the preprocessing function is called.
   this.rawVal = undefined
}

// Returns true if this port has received a value, false if not.
InputPort.prototype.hasValue = function() {
   return isDef(this.rawVal);
}

// Adds another typename to the list of types this port is allowed to accept.
// Values are received as-is if they match any of the supported types of this port.
// If they do not match, they are converted to the first type where a conversion from the value's
// type exists.
//
// typename: The name of the type of data that this port expects to receive.
//           Must be a name of a type already defined in the Atypical type system.
// preprocessingFunction: An optional function of one argument that gets called every time this
//                        port receives a value of this type. If defined, this.val gets the result
//                        of calling this function on the input value instead of the raw input value.
InputPort.prototype.addAcceptedType = function(typename, preprocessingFunction) {
   if (!AT.typeIsDefined(typename)) {
      console.error("Attempted to make an input port accept a type ("
         + typename + ") which has not been defined.");
      return;
   }
   if (isDef(preprocessingFunction)) {
      if (typeof(preprocessingFunction) !== "function") {
         console.error("Error adding alternate type to input port, expecting function as "
            + "preprocessing function, got " + typeof(preprocessingFunction));
         return;
      }
      if (preprocessingFunction.length !== 1) {
         console.error("Error adding alternate type to input port, the preprocessing function "
            + "must have exactly one argument (has " + preprocessingFunction.length + ")");
         return;
      }
   }
   else if (AT.isPrimitive(typename)) {
      // Create a default preprocessing function for primitive types.
      preprocessingFunction = function(x) { return x.toPrimitive(); };
   }

   this.acceptedTypes.push(typename);
   this.preprocessingFunctions[typename] = preprocessingFunction;
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
   if (!this._canAcceptValueOfType(value.typename)) {
      return false;
   }
   
   let handlePreprocessing = function() {
      let typename = this.rawVal.typename;
      if (isDef(this.preprocessingFunctions[typename])) {
         this.val = this.preprocessingFunctions[typename](this.rawVal);
      }
      else {
         this.val = this.rawVal;
      }
   }.bind(this);

   // Check if we accept this type directly. If so, take it in.
   for (let i = 0; i < this.acceptedTypes.length; i++) {
      if (value.typename === this.acceptedTypes[i]) {
         this.rawVal = value;
         handlePreprocessing();
         return true;
      }
   }
   for (let i = 0; i < this.acceptedTypes.length; i++) {
      if (value.canConvert(this.acceptedTypes[i])) {
         this.rawVal = value.convert(this.acceptedTypes[i]);
         handlePreprocessing();
         return true;
      }
   }
   return false;
}

// Returns whether or not this port can accept a value of the given typename.
// If the type specified is not a string specifying an already-defined Atypical type,
// then this returns false.
InputPort.prototype._canAcceptValueOfType = function(typename) {
   if (typeof(typename) !== "string" || !AT.typeIsDefined(typename)) {
      return false;
   }

   for (let i = 0; i < this.acceptedTypes.length; i++) {
      if (AT.canConvert(typename, this.acceptedTypes[i])) {
         return true;
      }
   }
   return false;
}

// Internal function used to clear the last received value from this port.
InputPort.prototype._clear = function() {
   this.rawVal = undefined;
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

// Gets the value (after preprocessing) for the port at index i. Returns undefined if there is no
// port i or if port i has not received a value.
InputPortList.prototype.value = function(i) {
   return this.hasValue(i) ? this.port(i).val : undefined;
}

// Returns the raw input value, without calling the preprocessing function on it. Returns undefined
// if there is no port i or if port i has not received a value.
InputPortList.prototype.rawValue = function(i) {
   return this.hasValue(i) ? this.port(i).rawVal : undefined;
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
