"use strict";

const Container = (function() {
   let _c = {};

   function Invisible() {
      let defaultArgs = {
         x : 0, y : 0, z : 0
      };        
      function _Invisible(_args) {
         this.point = [
            _args.x,
            _args.y,
            _args.z || defaultArgs.z
         ];
      }
      _Invisible.prototype.draw = function(offset) {};

      return function(argsOverride) { 
         return new _Invisible(argsOverride || args || defaultArgs); 
      };
   }
   _c.Invisible = Invisible;

   function Rectangle(args) {
      let defaultArgs = {
         x : 0, y : 0, z : 0,
         w : 2, h : 1, d : 0
      }; // TODO maybe the special Position vector objects I made instead of x, y, z, etc ...

      function _Rectangle(_args) {
         this.point = [
            _args.x,
            _args.y,
            _args.z || defaultArgs.z
         ];

         this.w = _args.w;
         this.h = _args.h;
         this.d = _args.d || defaultArgs.d;
      }
      _Rectangle.prototype.draw = function(offset) {
         // TODO 
      };

      return function(argsOverride) { 
         return new _Rectangle(argsOverride || args || defaultArgs); 
      };
   }
   _c.Rectangle = Rectangle;

   function Circle(args) {
      let defaultArgs = {
         x : 0, y : 0, z : 0,
         radius : 1,
         is3D : false
      }; // TODO         
      
      function _Circle(_args) {
         this.point = [
            _args.x,
            _args.y,
            _args.z || defaultArgs.z
         ];

         this.radius = _args.radius;
         this.is3D = _args.is3D || false;
      }
      _Circle.prototype = {
         getPoint : function() { return this.point; },
         draw : function(offset) {
            const r = this.radius;
            m.save();
               m.translate(this.point);
               mDrawOval([-r, -r], [r, r], 32, PI / 2 - TAU);
            m.restore();
         },

         // GIVEN ANOTHER CIRCLE, GET LINE SEGMENT POINTS FOR DRAWING A LINE BETWEEN THE SHAPES AS DESIRED
         getLineSegment : function(other) {
            const thisPoint = this.getPoint();
            const otherPoint = other.getPoint(); // TODO MAKE CONTAINERS INTERACT WITH POINTEES TO GET THEIR POSITIONS
            const vec = [otherPoint[0] - thisPoint[0], otherPoint[1] - thisPoint[1], otherPoint[2] - thisPoint[2]];
            const dist = sqrt((vec[0] * vec[0]) + (vec[1] * vec[1]) + (vec[2] * vec[2]));

            const thisRadius = this.radius;
            const otherRadius = other.radius;

            let negation = 1;
             
            // 2D CIRCLE COLLISION FOR NOW (ODDITIES WHEN CIRCLES COLLIDE OR OVERLAP, TODO fix)
            // const rSum = otherRadius + thisRadius;
            // if (dist < rSum * rSum) {
            //    negation = -1;
            // }

            const startPoint = [
               thisPoint[0] + thisRadius / dist * negation * vec[0],
               thisPoint[1] + thisRadius / dist * negation * vec[1],
               thisPoint[2] + thisRadius / dist * negation * vec[2],
            ]; 
            const endPoint = [
               otherPoint[0] - otherRadius / dist * vec[0],
               otherPoint[1] - otherRadius / dist * vec[1],
               otherPoint[2] - otherRadius / dist * vec[2],
            ];

            return [startPoint, endPoint];
         }
      };

   // function drawParentToChildEdge(center, radius, childCenter) {
   //    if (childCenter == undefined) {
   //       return;
   //    }
   //    const childParentVec = [childCenter[0] - center[0], childCenter[1] - center[1]];
   //    const childParentDist = sqrt(pow(childParentVec[0], 2) + pow(childParentVec[1], 2));

   //    const edgeOfParent = [center[0] + radius / childParentDist * childParentVec[0], center[1] + radius / childParentDist * childParentVec[1]];
   //    const edgeOfChild = [childCenter[0] - radius / childParentDist * childParentVec[0], childCenter[1] - radius / childParentDist * childParentVec[1]];
   //    mLine(edgeOfParent, edgeOfChild);
   // }

      return function(argsOverride) { 
         return new _Circle(argsOverride || args || defaultArgs);
      };
   }
   _c.Circle = Circle;


   _c.registerContainer = function(args) {
      if (arg === undefined) {
         return false;
      }
      
      let name = args.name;
      let constructor = args.constructor;
      let defaultArgs = args.defaultArgs;
      if (name === undefined || 
         constructor === undefined ||
         defauultArgs === undefined) {
         return false;
      }
      
      _c[name] = function(_args) {
         return function(argsOverride) { 
            return new constructor(argsOverride || _args || defaultArgs); 
         };            
      };
        
      return true;
   }

   return _c;
}());