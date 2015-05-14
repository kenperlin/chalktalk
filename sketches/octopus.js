
var isRushingCamera = false;
function OctopusResponder() {
   var velocity = 0;
   this.doI(
      undefined,
      function() {                                             // Drag on a node to move it.
         if (this.I <= this.graph.headLastIndex) {
            var dst = this.graph.nodes[this.I].p;
            if (isRushingCamera) {
               dst.z += velocity;
               dst.y -= velocity * .72;
               sk().scale(1 + velocity);
               velocity += 0.001;
            }
            else {
               var blend = 0.1;
               var src = this.graph.p;
               dst.x = mix(dst.x, src.x, blend);
               dst.y = mix(dst.y, src.y, blend);
               dst.z = mix(dst.z, src.z, blend);
            }
         }
      }
   );

   this.dVec = newVec3();
   this.vVec = newVec3();
   this.wVec = newVec3();
   this.xVec = newVec3();
   this.yVec = newVec3();

   this.simulate = function() {
      var nodes = this.graph.nodes;

      if (this.I == -1) {

         // KEEP HEAD ABOVE BODY

         var upForce = .1;
         nodes[0].p.y += upForce;
         var n = nodes.length;
         for (var i = 3 ; i < n ; i++)
            nodes[i].p.y -= upForce / (n - 3);

         // KEEP EYES LEVEL

         var iUpperEye = nodes[1].p.y >= nodes[2].p.y ? 1 : 2;
         var iLowerEye = nodes[1].p.y <  nodes[2].p.y ? 1 : 2;
         nodes[iLowerEye].p.y += .01;
         nodes[iUpperEye].p.y -= .01;

         // FACE FORWARD

         var t = nodes[2].p.z - nodes[1].p.z;
         var i = t > 0 ? 1 : 2;
         if (nodes[3-i].p.z < nodes[0].p.z) i = 3 - i;
         t = .1 * abs(t);
         nodes[0].p.z -= t;
         nodes[i].p.z += t;
      }

      if (nodes[0].g !== undefined) {
         var D = this.dVec, V = this.vVec, W = this.wVec, X = this.xVec, Y = this.yVec;

         var E = nodes[0].g.matrix.elements;
         X.set(E[0], E[1], E[2]);
         Y.set(E[4], E[5], E[6]);

         for (var limb = 0 ; limb < this.graph.nLimbs ; limb++) {
            for (var joint = 1 ; joint < this.graph.nJoints ; joint++) {
               var P = nodes[this.graph.jointIndex(limb, joint)].p;

               D.copy(P).sub(nodes[0].p);

               V.copy(D).sub(W.copy(X).multiplyScalar(.5 * D.dot(X) / X.dot(X)))
                        .sub(W.copy(Y).multiplyScalar(.5 * D.dot(Y) / Y.dot(Y)));

               var t = noise(2*V.x + 100 * this.graph.id, 2*V.y + this.graph.frequency * time, 2*V.z + 100 * limb)
                       * this.graph.amplitude * (joint < this.graph.nJoints - 1 ? .08 : .2);

               var lenSq = X.lengthSq() + Y.lengthSq();
               P.add(V.copy(X).multiplyScalar(t * X.dot(D) / lenSq))
                .add(V.copy(Y).multiplyScalar(t * Y.dot(D) / lenSq));
            }
         }
      }
   }
}
OctopusResponder.prototype = new GraphResponder;

function Octopus() {
   this.label = 'octopus';
   this.is3D = true;

   this.graph = new VisibleGraph();
   this.graph.setResponder(new OctopusResponder());

   var nLimbs = this.graph.nLimbs = 8;
   var nJoints = this.graph.nJoints = 8;

   this.graph.nLimbs = nLimbs;
   this.graph.nJoints = nJoints;

   this.graph.jointRadius = function(joint) {
      return mix(0.08, .015, joint / this.nJoints);
   }

   this.graph.jointIndex = function(limb, joint) {
      return this.headLastIndex + 1 + this.nJoints * limb + joint;
   }

   this.setup = function() {
      this.graph.id = this.id;
      this.graph.clear();

      this.graph.addNode(  0,.5, 0);

      var v = newVec3();
      v.set(1, 0, 1).normalize().multiplyScalar(0.55);
      this.graph.addNode(-v.x, .5+v.y, v.z);
      this.graph.addNode( v.x, .5+v.y, v.z);

      this.graph.addNode(0, 0, 0);

      this.graph.headLastIndex = this.graph.nodes.length - 1;

      for (var n = 0 ; n <= this.graph.headLastIndex ; n++)
         this.graph.nodes[n].nm = n == 0 ? 32 : n < 3 ? 16 : 2;

      for (var limb = 0 ; limb < nLimbs ; limb++) {
         var theta = TAU * limb / nLimbs;
         for (var joint = 0 ; joint < nJoints ; joint++) {
            var t = joint / nJoints;
            var r = mix(0.20,  1.0, mix(t, t * t * t, .9));
            var y = mix(0.10, -1.0, 1 - (1 - t) * (1 - t));
            this.graph.addNode(r * cos(theta), y, r * sin(theta));

            if (joint > 0) {
               var nodeIndex = this.graph.nodes.length - 1;
               var linkIndex = this.graph.addLink(nodeIndex-1, nodeIndex);
               this.graph.links[linkIndex].joint = joint;
            }
         }
      }

      var eyeLinkIndex0 = this.graph.addLink(0,1,2);
      var eyeLinkIndex1 = this.graph.addLink(0,2,2);

      this.nNodesToRender = this.graph.nodes.length;
      this.nLinksToRender = this.graph.links.length;

      this.graph.addLink(1,2,2);

      for (var limb = 0 ; limb < nLimbs ; limb++)
      for (var joint = 0 ; joint < nJoints ; joint++) {
         var weight = joint == 0 ? 2 : 0.01;
         var nodeIndex = this.graph.jointIndex(limb, joint);
         for (var i = 0 ; i <= this.graph.headLastIndex ; i++)
            this.graph.addLink(i, nodeIndex, weight);
         this.graph.addLink(nodeIndex, this.graph.jointIndex((limb + 1) % nLimbs, joint), weight);
      }

      this.graph.nodes[0].r = .5;
      this.graph.nodes[1].r = .06;
      this.graph.nodes[2].r = .06;
      this.graph.nodes[3].r = .01;

      for (var limb = 0 ; limb < nLimbs ; limb++)
      for (var joint = 0 ; joint < nJoints ; joint++) {
         var i = this.graph.jointIndex(limb, joint);
         this.graph.nodes[i].r = this.graph.jointRadius(joint);
      }

      for (var n = this.graph.headLastIndex + 1 ; n < this.graph.nodes.length ; n++)
         this.graph.nodes[n].nm = 4;

      for (var n = 0 ; n < this.graph.links.length ; n++)
         this.graph.links[n].nm = 4;
      this.graph.links[eyeLinkIndex0].nm = 16;
      this.graph.links[eyeLinkIndex1].nm = 16;

      this.graph.computeLengths();
   }

   this.onMove    = function(point) { return this.graph.onMove   (point); }
   this.onPress   = function(point) { return this.graph.onPress  (point); }
   this.onDrag    = function(point) { return this.graph.onDrag   (point); }
   this.onRelease = function(point) { return this.graph.onRelease(point); }

   this.render = function() {
      this.code = null;
      var graph = this.graph;
      var nodes = graph.nodes;
      var links = graph.links;
      graph.pixelSize = this.computePixelSize();

      graph.amplitude = isDef(this.inValues[0]) ? this.inValues[0] : 1;
      graph.frequency = isDef(this.inValues[1]) ? this.inValues[1] : 1;

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
          mCurve(makeSpline([[.4,-.1],[ .5, .7],[   0, 1],[ -.5, .7],[-.4,-.1]]));
          mCurve(makeSpline([[-.25,0],[-.3,-.5],[-.50,-1]]));
          mCurve(makeSpline([[ .25,0],[ .3,-.5],[ .75,-1]]));
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         graph.update();
         for (var j = 0 ; j < this.nNodesToRender ; j++)
            this.renderNode(nodes[j]);
         for (var j = 0 ; j < this.nLinksToRender ; j++)
         //for (var j = 0 ; j < this.graph.links.length ; j++)
            this.renderLink(links[j]);

         this.meshBounds = [];
         for (var j = 0 ; j < this.nNodesToRender ; j++) {
            var node = nodes[j], p = node.p, r = node.r;
            for (var a = -r ; a <= r ; a += r + r)
            for (var b = -r ; b <= r ; b += r + r)
            for (var c = -r ; c <= r ; c += r + r)
               this.meshBounds.push([p.x + a, p.y + b, p.z + c]);
         }
         this.extendBounds(this.meshBounds);

         // GRADUALLY RECENTER THE OCTOPUS TO ITS LOCAL ORIGIN.

         if (this._recenter_point === undefined)
            this._recenter_point = newVec3(0,1,0);
         var dp = this.recenter3DSketch(nodes[0].p, this._recenter_point);
         for (var n = 0 ; n < nodes.length ; n++) 
            nodes[n].p.sub(dp);
/*
         // BLINKING LOGIC (DISABLED FOR NOW).

         if (this.blinkTime === undefined)
            this.blinkTime = time;
         if (time > this.blinkTime)
            this.blinkTime = time + mix(1, 3, random());  
         var eyesOpen = this.blinkTime - time < .1 ? 0 : 1;
         this._eyeMaterial.setAmbient(.05 + .6 * eyesOpen, .05, .05);
*/
         // MODIFY ALL MATERIALS FOR FOG DISTANCE.


         if (isFog || isRushingCamera) {
            var foggy = exp(-this.scale() * .5);
            this._nodeMaterial.setUniform('uFoggy', foggy);
            this._linkMaterial.setUniform('uFoggy', foggy);
         }
      });
   }

   this._p = newVec3();
   this._q = newVec3();
   this.xyzw = new THREE.Vector4();

   this.createMesh = function() {
      var mesh = new THREE.Mesh();
      mesh.setMaterial(this.getNodeMaterial());
      return mesh;
   }

   this.renderNode = function(node) {
      var nodes = this.graph.nodes;
      if (node.g === undefined) {
         var material = node == nodes[1] || node == nodes[2]
                      ? this.getEyeMaterial() : this.getNodeMaterial();
         this.mesh.add(node.g = this.graph.newNodeMesh(material, node.r, node.nm));
      }

      if (node == nodes[0]) {
         var geometry = node.g.geometry;
         var vertices = geometry.vertices;
         for (var i = 0 ; i < vertices.length ; i++) {
            var v = vertices[i];
            if (v.z > 0) {
               var r = 1 - .3 * (v.z * v.z);
               v.x *= r;
               v.y *= r;
               v.z = sin(PI * v.z);
            }
         }
         geometry.computeVertexNormals();
         node.g.up.copy(nodes[1].p).sub(node.p)
                   .add(nodes[2].p).sub(node.p); // AIM HEAD Y AXIS MID-WAY BETWEEN EYES.
         node.g.lookAt(nodes[3].p);              // AIM HEAD Z AXIS DOWNWARD.
      }

      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      var graph = this.graph;
      if (link.g === undefined) {
         var weight = Math.sqrt(link.w);
         var joint = link.joint === undefined ? 0 : link.joint;
         var radius1 = .8 * weight * graph.jointRadius(joint + 1);
         var radius0 = .8 * weight * graph.jointRadius(joint);
         this.mesh.add(link.g = graph.newLinkMesh(this.getLinkMaterial(), radius1, radius0, link.nm));
      }
      link.g.placeStick(graph.nodes[link.i].p, graph.nodes[link.j].p);
   }

   var nodeFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * .5;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + 1.1 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 12.) * P) / 12.);'
   ,'   vec3 color = vec3(.01,.01,.01);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .05 * max(0.,D) + 1.3 * pow(max(0., S), 10.) ) * n * n;'
   ,'   }'
   ,'   color *= vec3(.5,.1,.05);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), alpha);'
   ,'}'
   ].join("\n");

   var linkFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform float uFoggy;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3 P = vPosition * .5;'
   ,'   vec3 N = normalize(vNormal);'
   ,'   vec3 W = vec3(0.,0.,-1.);'
   ,'   vec3 R = W - 2. * N * dot(N, W);'
   ,'   float n = 1. + 1.1 * (noise(P) + noise(4. * P) / 4. + noise(vec3(24., 24., 12.) * P) / 12.);'
   ,'   vec3 color = vec3(.01,.01,.01);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( .05 * max(0.,D) + 1.3 * pow(max(0., S), 20.) ) * n * n;'
   ,'   }'
   ,'   color *= vec3(.5,.5,.5);'
   ,'   vec3 fog = vec3(24.,43.,62.) / 255.;'
   ,'   gl_FragColor = vec4(mix(sqrt(color), fog, uFoggy), alpha);'
   ,'}'
   ].join("\n");

   this.getNodeMaterial = function() {
      if (this._nodeMaterial === undefined) {
         this.fragmentShader = nodeFragmentShader;
         var r = 1, g = .5, b = .25;
         this._nodeMaterial = this.shaderMaterial([r/200,g/200,b/200],
                                                  [r/ 30,g/ 30,b/ 30],
                                                  [r/  2,g/  2,b/  2, 7]);
      }
      return this._nodeMaterial;
   }

   this.getLinkMaterial = function() {
      if (this._linkMaterial === undefined) {
         var r = 1, g = 1, b = 1;
         this.fragmentShader = linkFragmentShader;
         this._linkMaterial = this.shaderMaterial([r/200,g/200,b/200],
                                                  [r/ 30,g/ 30,b/ 30],
                                                  [r/  2,g/  2,b/  2, 7]);
      }
      return this._linkMaterial;
   }

   this.getEyeMaterial = function() {
      if (this._eyeMaterial === undefined)
         this._eyeMaterial = new phongMaterial().setAmbient(.65,.05,.05)
                                                .setDiffuse(.05,.05,.05)
                                                   .setSpecular(.2,.2,.2,20);
      return this._eyeMaterial;
   }
}
Octopus.prototype = new Sketch;
addSketchType('Octopus');

