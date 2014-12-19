;(function() {
var core, utility_threeExtension, utility_Utils, objects_CTObject, objects_Port, objects_Sketch, objects_testObject, UI_CTUI, main, app;
core = function (require) {
  /**
  * Chalktalk is a gesture based communication tool
  * @author Ken Perlin
  * @version  .001
  * @class _Chalktalk
  */
  var CT = { version: 'v.001' };
  return CT;
}({});
utility_threeExtension = function () {
  THREE.Material.prototype.setUniform = function (name, src) {
    if (this.uniforms[name] !== undefined) {
      var val = src;
      if (Array.isArray(src)) {
        if (!Array.isArray(src[0]))
          val = toVec(src);
        else {
          val = [];
          for (var i = 0; i < src.length; i++)
            val.push(toVec(src[i]));
        }
      }
      this.uniforms[name].value = val;
    }
  };
  THREE.Object3D.prototype.setMaterial = function (material) {
    if (isShowingMeshEdges)
      material = bgMaterial();
    this.material = material;
    for (var i = 0; i < this.children.length; i++)
      this.children[i].setMaterial(material);
    return this;
  };
  THREE.Object3D.prototype.setOpacity = function (opacity) {
    this.material.opacity = opacity;
    this.material.transparent = true;
    for (var i = 0; i < this.children.length; i++)
      this.children[i].setOpacity(opacity);
    return this;
  };
  THREE.Object3D.prototype.getMatrix = function () {
    if (this.mat === undefined)
      this.mat = new M4();
    return this.mat;
  };
  THREE.Object3D.prototype.setMatrix = function (mat) {
    if (this.mat === undefined)
      this.mat = new M4();
    this.mat.copy(mat._m());
  };
  THREE.Object3D.prototype.updateMatrix = function () {
    if (this.mat === undefined)
      this.matrix.compose(this.position, this.quaternion, this.scale);
    else {
      var v = this.mat._m();
      this.matrix.set(v[0], v[4], v[8], v[12], v[1], v[5], v[9], v[13], v[2], v[6], v[10], v[14], v[3], v[7], v[11], v[15]);
    }
    this.matrixWorldNeedsUpdate = true;
  };
  THREE.Object3D.prototype.addTorus = function (r, m, n) {
    var geometry = torusGeometry(r, m, n);
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addLathe = function (p, nSegments) {
    var points = [];
    for (var i = 0; i < p.length; i++)
      points.push(new THREE.Vector3(p[i][0], p[i][1], p[i][2]));
    var geometry = latheGeometry(points, nSegments);
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addCylinder = function (n) {
    if (n === undefined)
      n = 24;
    var geometry = cylinderGeometry(n);
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addOpenCylinder = function (n) {
    if (n === undefined)
      n = 24;
    var geometry = openCylinderGeometry(n);
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addCube = function () {
    var geometry = cubeGeometry();
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addPlane = function () {
    var geometry = planeGeometry();
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addGlobe = function (m, n, p0, p1, t0, t1) {
    if (m === undefined)
      m = 32;
    if (n === undefined)
      n = floor(m / 2);
    var geometry = globeGeometry(m, n, p0, p1, t0, t1);
    var mesh = new THREE.Mesh(geometry, bgMaterial());
    this.add(mesh);
    return mesh;
  };
  THREE.Object3D.prototype.addNode = function () {
    var mesh = new THREE.Mesh();
    this.add(mesh);
    return mesh;
  };
  THREE.Geometry.prototype.computeEdges = function () {
    function testEdge(edges, a, b) {
      var h = Math.min(a, b) + ',' + Math.max(a, b);
      if (hash[h] === undefined)
        hash[h] = n;
      else
        edges.push([
          hash[h],
          n,
          [
            a,
            b
          ]
        ]);
    }
    this.edges = [];
    var hash = {};
    for (var n = 0; n < this.faces.length; n++) {
      var face = this.faces[n];
      testEdge(this.edges, face.a, face.b);
      testEdge(this.edges, face.b, face.c);
      testEdge(this.edges, face.c, face.a);
    }
  };
  THREE.Object3D.prototype.toStrokes = function () {
    return edgesToStrokes(this.projectVisibleEdges(this.findVisibleEdges()));
  };
  THREE.Object3D.prototype.findBoundsWorld = function (bb) {
    if (bb === undefined) {
      this.updateMatrixWorld();
      bb = [
        10000,
        10000,
        10000,
        -10000,
        -10000,
        -10000
      ];
    }
    this.geometry.matrixWorld = this.matrixWorld;
    this.geometry.expandBoundsWorld(bb);
    for (var k = 0; k < this.children.length; k++)
      this.children[k].findBoundsWorld(bb);
    return bb;
  };
  THREE.Object3D.prototype.findVisibleEdges = function (ve) {
    if (ve === undefined) {
      this.updateMatrixWorld();
      ve = [];
    }
    this.geometry.matrixWorld = this.matrixWorld;
    ve.push([
      this.geometry,
      this.geometry.findVisibleEdges()
    ]);
    for (var k = 0; k < this.children.length; k++)
      this.children[k].findVisibleEdges(ve);
    return ve;
  };
  THREE.Object3D.prototype.projectVisibleEdges = function (veds) {
    var e2 = [];
    function p2xy(p) {
      return [
        projectX(p.x),
        projectY(p.y)
      ];
    }
    function e2moveTo(p) {
      e2.push([p2xy(p)]);
    }
    function e2lineTo(p) {
      var e = e2[e2.length - 1];
      var xy = p2xy(p);
      if (e[0][0] == xy[0] && e[0][1] == xy[1])
        e2.splice(e2.length - 1, 1);
      else
        e.push(xy);
    }
    var E0 = new THREE.Vector3();
    var E1 = new THREE.Vector3();
    for (var k = 0; k < veds.length; k++) {
      var geom = veds[k][0];
      var edges = veds[k][1];
      for (var n = 0; n < edges.length; n++) {
        var V0 = geom.vertexWorld(edges[n][0]);
        var V1 = geom.vertexWorld(edges[n][1]);
        var d = V0.distanceTo(V1);
        var nSteps = max(1, floor(d / 0.03));
        E1.copy(V0);
        var wasHidden = this.isHiddenPoint(E1);
        if (!wasHidden)
          e2moveTo(E1);
        for (var step = 1; step <= nSteps; step++) {
          E0.copy(E1);
          E1.copy(V0).lerp(V1, step / nSteps);
          var isHidden = this.isHiddenPoint(E1);
          if (!wasHidden && isHidden)
            e2lineTo(E0);
          if (wasHidden && !isHidden)
            e2moveTo(E1);
          wasHidden = isHidden;
        }
        if (!wasHidden)
          e2lineTo(E1);
      }
    }
    return e2;
  };
  THREE.Object3D.prototype.isHiddenPoint = function (p) {
    if (this.geometry.isHiddenPoint(p))
      return true;
    for (var k = 0; k < this.children.length; k++)
      if (this.children[k].isHiddenPoint(p))
        return true;
    return false;
  };
  THREE.Geometry.prototype.expandBoundsWorld = function (bb) {
    for (var n = 0; n < this.vertices.length; n++) {
      var v = this.vertexWorld(n);
      bb[0] = min(bb[0], v.x);
      bb[1] = min(bb[1], v.y);
      bb[2] = min(bb[2], v.z);
      bb[3] = max(bb[3], v.x);
      bb[4] = max(bb[4], v.y);
      bb[5] = max(bb[5], v.z);
    }
  };
  THREE.Geometry.prototype.findVisibleEdges = function () {
    var visibleEdges = [];
    if (this.edges === undefined)
      this.computeEdges();
    var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.matrixWorld);
    // COMPUTE VIEW DEPENDENT NORMAL FOR EVERY FACE.
    for (var n = 0; n < this.faces.length; n++) {
      var face = this.faces[n];
      if (face.viewNormal === undefined)
        face.viewNormal = new THREE.Vector3();
      face.viewNormal.copy(face.normal).applyMatrix3(normalMatrix).normalize();
    }
    // FIND EDGES THAT ARE EITHER LOCALLY SILHOUETTE OR DIHEDRAL.
    for (var n = 0; n < this.edges.length; n++) {
      var edge = this.edges[n];
      var n0 = this.faces[edge[0]].viewNormal;
      var n1 = this.faces[edge[1]].viewNormal;
      if (n0.z >= -0.0001 && n1.z <= 0.0001 || n0.z <= 0.0001 && n1.z >= -0.0001 || n0.dot(n1) < 0.5) {
        // console.log("v  dot = " + (n0.dot(n1).toFixed(6)) + ", " + n0.z.toFixed(6) + ", " + n1.z.toFixed(6)); 
        visibleEdges.push(edge[2]);
      } else {
      }
    }
    // console.log("fve: hidden point count = " + ___hiddenpoint_count.toFixed(0));
    ___hiddenpoint_count = 0;
    return visibleEdges;
  };
  THREE.Geometry.prototype.vertexWorld = function (i) {
    if (this.verticesWorld === undefined)
      this.verticesWorld = [];
    if (this.verticesWorld[i] === undefined)
      this.verticesWorld[i] = new THREE.Vector3();
    return this.verticesWorld[i].copy(this.vertices[i]).applyMatrix4(this.matrixWorld);
  };
  THREE.Geometry.prototype.addLine = function (t, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, d = sqrt(dx * dx + dy * dy);
    dx *= t / 2 / d;
    dy *= t / 2 / d;
    this.vertices.push(new THREE.Vector3(a.x + dy, a.y - dx, a.z + t));
    this.vertices.push(new THREE.Vector3(b.x + dy, b.y - dx, b.z + t));
    this.vertices.push(new THREE.Vector3(b.x - dy, b.y + dx, b.z + t));
    this.vertices.push(new THREE.Vector3(a.x - dy, a.y + dx, a.z + t));
    var nf = this.vertices.length;
    this.faces.push(new THREE.Face3(nf - 4, nf - 3, nf - 2));
    this.faces.push(new THREE.Face3(nf - 2, nf - 1, nf - 4));
  };
  THREE.Geometry.prototype.isHiddenPoint = function (p) {
    for (var n = 0; n < this.faces.length; n++)
      if (this.isPointHiddenByFace(p, n)) {
        ___hiddenpoint_count++;
        return true;
      }
    return false;
  };
  THREE.Geometry.prototype.isPointHiddenByFace = function (p, n) {
    var face = this.faces[n];
    return isPointHiddenByTriangle(p, this.vertexWorld(face.a), this.vertexWorld(face.b), this.vertexWorld(face.c));
  };
  THREE.Material.prototype.setAmbient = function (r, g, b) {
    this.emissive = newColor(r, g, b);
    return this;
  };
  THREE.Material.prototype.setDiffuse = function (r, g, b) {
    this.color = newColor(r, g, b);
    return this;
  };
  THREE.Material.prototype.setSpecular = function (r, g, b, p) {
    this.specular = newColor(r, g, b);
    this.shininess = p;
    return this;
  };
  return THREE;
}();
utility_Utils = function () {
  var CT = core;
  CT.Utils = {
    //JS
    extend: function (child, parent) {
      function TmpConst() {
      }
      TmpConst.prototype = parent.prototype;
      child.prototype = new TmpConst();
      child.prototype.constructor = child;
    },
    isUndef: function (thing) {
      return thing === void 0;
    },
    isDef: function (thing) {
      return !(thing === void 0);
    },
    arraysEqual: function (a, b) {
      if (a === b)
        return true;
      if (a === null || b === null)
        return false;
      if (a.length != b.length)
        return false;
      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i])
          return false;
      }
      return true;
    },
    cloneArray: function (src) {
      var dst = [];
      for (var i = 0; i < src.length; i++)
        if (src[i] instanceof Array)
          dst[i] = cloneArray(src[i]);
        else
          dst[i] = src[i];
      return dst;
    },
    arrayToString: function (a, level) {
      if (a.length == 0)
        return '[]';
      if (level === undefined)
        level = 0;
      var spacer = level == 0 ? ' ' : '';
      var str = '[' + spacer;
      for (var i = 0; i < a.length; i++)
        str += (a[i] instanceof Array ? arrayToString(a[i], level + 1) : a[i]) + spacer + (i < a.length - 1 ? ',' + spacer : ']');
      return str;
    },
    firstUndefinedArrayIndex: function (arr) {
      var n = 0;
      while (n < arr.length && isDef(arr[n]) && arr[n] !== null)
        n++;
      return n;
    },
    getIndex: function (arr, obj) {
      var i = arr.length;
      while (--i >= 0 && arr[i] !== obj);
      return i;
    },
    sample: function (arr, t) {
      t = max(0, min(0.999, t));
      var n = arr.length;
      if (n == 1)
        return arr[0];
      var i = floor((n - 1) * t);
      var f = (n - 1) * t - i;
      return lerp(f, arr[i], arr[i + 1]);
    },
    newZeroArray: function (size) {
      var dst = [];
      for (var i = 0; i < size; i++)
        dst.push(0);
      return dst;
    },
    findSyntaxError: function (code) {
      var error = [];
      var save_onerror = onerror;
      onerror = function (errorMsg, url, lineNumber) {
        error = [
          lineNumber,
          errorMsg.replace('Uncaught ', '')
        ];
      };
      var element = document.createElement('script');
      element.appendChild(document.createTextNode(code));
      document.body.appendChild(element);
      onerror = save_onerror;
      return error;
    },
    //THREE
    sphere: function (s, x, y) {
      var divX = x || 12;
      var divY = y || 12;
      return new THREE.Mesh(new THREE.SphereGeometry(s, x, y), new THREE.MeshLambertMaterial());
    },
    vec: function (x, y, z) {
      return new THREE.Vector3(x, y, z);
    },
    zeroVec: function () {
      return new THREE.Vector3(0, 0, 0);
    },
    vecToString: function (v) {
      return '(' + v.x + ',' + v.y + ',' + v.z + ')';
    },
    //array to vec
    toVec: function (src) {
      switch (src.length) {
      default:
        return new THREE.Vector2(src[0], src[1]);
      case 3:
        return new THREE.Vector3(src[0], src[1], src[2]);
      case 4:
        return new THREE.Vector4(src[0], src[1], src[2], src[3]);
      }
    },
    //Math
    hexChar: function (n) {
      return String.fromCharCode((n < 10 ? 48 : 87) + n);
    },
    hex: function (n) {
      return this.hexChar(n >> 4) + this.hexChar(n & 15);
    },
    isNumeric: function (v) {
      return !isNaN(v);
    },
    roundedString: function (v, nDigits) {
      var nd = nDigits === undefined ? 2 : nDigits;
      if (typeof v == 'string')
        v = parseFloat(v);
      var p = nd <= 0 ? 1 : nd == 1 ? 10 : nd == 2 ? 100 : 1000;
      var str = '' + Math.floor(p * Math.abs(v) + 0.5) / p;
      if (nDigits !== undefined && nd > 0) {
        var i = str.indexOf('.');
        if (i < 0) {
          str += '.';
          i = str.length - 1;
        }
        while (str.length - i < nd + 1)
          str += '0';
      }
      return (v < 0 ? '-' : '') + str;
    },
    lineIntersectLine: function (va, vb, vc, vd) {
      var a = [
        va.x,
        va.y
      ];
      var b = [
        vb.x,
        vb.y
      ];
      var c = [
        vc.x,
        vc.y
      ];
      var d = [
        vd.x,
        vd.y
      ];
      function L(a) {
        return a[0] * A[0] + a[1] * A[1];
      }
      // FIRST MAKE SURE [c,d] CROSSES [a,b].
      var A = [
        b[1] - a[1],
        a[0] - b[0]
      ];
      var tb = L(b);
      var tc = L(c);
      var td = L(d);
      if (tc > tb == td > tb)
        return null;
      // THEN FIND THE POINT OF INTERSECTION p.
      var f = (tb - tc) / (td - tc);
      var p = [
        lerp(f, c[0], d[0]),
        lerp(f, c[1], d[1])
      ];
      // THEN MAKE SURE p LIES BETWEEN a AND b.
      A = [
        b[0] - a[0],
        b[1] - a[1]
      ];
      var tp = L(p);
      var ta = L(a);
      tb = L(b);
      var vec = new THREE.Vector3(p[0], p[1], 0);
      return tp >= ta && tp <= tb ? vec : null;
    },
    ik: function (len1, len2, footIn, aimIn) {
      var foot = footIn.clone();
      var aim = aimIn.clone();
      var cc = foot.dot(foot);
      var x = (1 + (len1 * len1 - len2 * len2) / cc) / 2;
      var y = foot.dot(aim) / cc;
      foot.multiplyScalar(y);
      aim.sub(foot);
      y = Math.sqrt(Math.max(0, len1 * len1 - cc * x * x) / aim.dot(aim));
      return new THREE.Vector3(x * footIn.x + y * aim.x, x * footIn.y + y * aim.y, x * footIn.z + y * aim.z);
    }
  };
  return CT;
}();
objects_CTObject = function () {
  var CT = core;
  /**
  	* Chalktalk basic object
  	* @constructor
  	* @return {obj} chalktalk base object
  	*/
  CT.CTObject = function (params) {
    this.args = params || {};
    THREE.Object3D.call(this);
    this.strokes = [];
    this.boundingBox = {};
    this.inValue = this.args.inValue || null;
    this.inValues = this.args.inValues || [];
    this.outValue = null;
    this.update = true;
    this.evaluator = this.args.evaluator || function (o) {
      return o;
    };
    this.ports = [];
    if (CT.CTObject.count === undefined) {
      CT.CTObject.count = 1;
    } else {
      CT.CTObject.count++;
    }
  };
  /**
  	* [prototype description]
  	* @type {Object}
  	*/
  CT.Utils.extend(CT.CTObject, THREE.Object3D);
  CT.CTObject.prototype.objectCount = function () {
    return CT.CTObject.count;
  };
  CT.CTObject.prototype.setInValue = function (value, index) {
    var i = index || this.inValues.length;
    this.inValues[index] = value;
  };
  CT.CTObject.prototype.getOutValue = function () {
    if (this.update);
    this.evaluate();
    return this.outValue;
  };
  CT.CTObject.prototype.evaluate = function () {
    this.portsToValues();
    this.outValue = this.evaluator(this.inValues);
  };
  CT.CTObject.prototype.portsToValues = function () {
    for (var i = 0; i < this.ports.length; i++) {
      this.setInValue(this.ports[i].getOutValue(), i);
    }
  };
  CT.CTObject.prototype.getPort = function (index) {
    if (CT.Utils.isDef(this.ports[index]))
      return this.ports[index];
    else
      return null;
  };
  CT.CTObject.prototype.getPortValue = function (index) {
    if (CT.Utils.isDef(this.ports[index]))
      return this.ports[index].getOutValue();
    else
      return null;
  };
  CT.CTObject.prototype.setPortValue = function (value, index) {
    if (CT.Utils.isDef(this.ports[index]))
      this.ports[index].setInValue(value);
  };
  /**
  * Add a new port
  * @param {object} portIndex,position,rotation,scale [description]
  */
  CT.CTObject.prototype.addPort = function (params) {
    var args = params || {};
    var portIndex = args.portIndex || this.ports.length;
    var position = args.position || CT.Utils.zeroVec();
    var rotation = args.rotation || new THREE.Euler(0, 0, 0);
    var scale = args.scale || CT.Utils.zeroVec();
    var port = new CT.Port();
    port.position = position;
    port.rotation = rotation;
    port.scale = scale;
    this.ports.splice(portIndex, 0, port);
  };
  /**
  * remove a port at index
  * @param  {int} index [description]
  */
  CT.CTObject.prototype.removePort = function (index) {
    this.ports.splice(portIndex, 1);
  };
  return CT;
}();
objects_Port = function (CT) {
  // var CT = require('core');
  /**
  	* Chalktalk basic object
  	* @constructor
  	* @return {obj} chalktalk base object
  	*/
  CT.Port = function (params) {
    this.args = params || {};
    THREE.Object3D.call(this);
    this.strokes = [];
    this.boundingBox = {};
    this.inValue = null;
    this.outValue = null;
    this.update = true;
    this.evaluator = this.args.evaluator || function (o) {
      return o;
    };
  };
  /**
  	* [prototype description]
  	* @type {Object}
  	*/
  CT.Utils.extend(CT.Port, THREE.Object3D);
  /**
  * in Value setter
  * @param {[type]} val [description]
  */
  CT.Port.prototype.setInValue = function (val) {
    if (CT.Utils.isDef(val)) {
      this.inValue = val;
    }
    this.outValue = this.evaluator(this.inValue);
  };
  CT.Port.prototype.processValue = function (f) {
    var that = this;
    var func = f || this.evaluator;
    var process = null;
    //if the in value is a sketch evaluate it
    //if not pass the value
    if (this.inValue.getOutValue) {
      this.inValue.evaluate();
      process = this.inValue.getOutValue();
    } else
      process = this.inValue;
    this.outValue = func(process);
  };
  /**
  * out Value getter
  * @return {[type]}     [description]
  */
  CT.Port.prototype.getOutValue = function () {
    if (this.update)
      this.processValue();
    return this.outValue;
  };
  return CT;
}(core);
objects_Sketch = function () {
  var CT = core;
  /**
  	* Chalktalk Sketch Object
  	* @constructor
  	* @return {obj} chalktalk base object
  	*/
  CT.Sketch = function (params) {
    this.args = params || {};
    CT.CTObject.call(this, params);
  };
  /**
  	* [prototype description]
  	* @type {Object}
  	*/
  CT.Utils.extend(CT.Sketch, CT.CTObject);
  CT.Sketch.prototype.evalCode = function (code, x, y, z) {
    // IF NO ARGS ARE SUPPLIED, USE VALUES FROM THE SKETCH'S INPUT PORTS.
    function defaultToZero(arg) {
      return arg === undefined ? 0 : arg;
    }
    if (x === undefined)
      x = defaultToZero(this.inValues[0]);
    if (y === undefined)
      y = defaultToZero(this.inValues[1]);
    if (z === undefined)
      z = defaultToZero(this.inValues[2]);
    // IF NO RETURN STATEMENT, SUPPLY ONE.
    if (code.indexOf('return') == -1)
      code = 'return ' + code;
    // EVAL THE CODE, REFERRING TO THE SKETCH AS "me".
    var result = null;
    try {
      result = Function('me', 'x', 'y', 'z', code)(this, x, y, z);
    } catch (e) {
    }
    // ANY ERROR RESULTS IN A RETURN VALUE OF null.
    this.outValue = result;
    return result;
  };
  return CT;
}();
objects_testObject = function () {
  var CT = core;
  /**
  	* Chalktalk basic object
  	* @constructor
  	* @return {obj} chalktalk base object
  	*/
  CT.obj = function () {
    /**public variables go here under 'this'*/
    this.publicVar = Math.PI;
    //static variable
    if (CT.obj.count == undefined) {
      CT.obj.count = 1;
    } else {
      CT.obj.count++;
    }
  };
  /**
  	* [prototype description]
  	* @type {Object}
  	*/
  CT.obj.prototype = {
    objectCount: function () {
      console.log(CT.obj.count);
    },
    //I don't think this is required, not sure
    // constructor: CT.obj, 
    /** a test private variable*/
    _privateVar: 36,
    /**returns the private variable*/
    get privateVar() {
      return this._privateVar;
    },
    /**
    * sets a private variable to a number
    * @type {number} a set a number
    */
    set privateVar(a) {
      if (typeof a == 'number')
        this._privateVar = a;
      else
        console.log('NaN');
    }
  };
  return CT;
}();
UI_CTUI = function (Utils) {
  var CT = core;
  CT.UI = function (canvas, args) {
    if (!args)
      args = {};
    this.vectors = args.vectors || [];
    this.ctrls = args.ctrls || [];
    this.ctrlAmount = args.ctrlAmount || 10;
    this.setVec = args.setVec || [];
    this.lerpColors = [];
    this._drawLine = false;
    this._moveCtrl = -1;
    this.init();
    this.Utils = util;
  };
  var util = {
    dist: function (a, b) {
      var X = Math.abs(a.x - b.x);
      var Y = Math.abs(a.y - b.y);
      return Math.sqrt(X * X + Y * Y);
    },
    lerp: function (a, b, t) {
      return a + (b - a) * t;
    }
  };
  CT.UI.prototype = {
    init: function (x, y) {
      // document.body.innerHTML += '<canvas id="canvasID"></canvas>'; // the += means we add this to the inner HTML of body
      this.width = x || 300;
      this.height = y || 300;
      var makeString = '<canvas id="canvasID"></canvas>';
      var cDiv = document.getElementById('canvasDiv').innerHTML = makeString;
      // replaces the inner HTML of #someBox to a canvas
      // cDiv.width =  this.width;
      // cDiv.height = this.height;
      this.cDiv = document.getElementById('canvasDiv');
      this.c = document.getElementById('canvasID');
      this.c.width = this.width;
      this.c.height = this.height;
      this.ctx = this.c.getContext('2d');
      this.setVectors();
      this.addEventListeners();
      this.drawVectors();
    },
    initScene: function () {
      this.camera = new THREE.OrthographicCamera(0, this.width, 0, this.height, 1, 10000);
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({ alpha: true });
      this.renderer.setClearColor(10066329, 1);
      this.renderer.setSize(this.width, this.height);
      console.log(this.cDiv);
      this.cDiv.appendChild(this.renderer.domElement);
      this.camera.position.z = 300;
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
      // this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement);
      //add light
      this.scene.add(new THREE.AmbientLight(2236962));
      console.log(Utils.Utils);
      console.log(this);
      this.standin = [];
      for (var i = 0; i < 3; i++) {
        this.standin[i] = new CT.Sketch();
        //Utils.Utils.sphere(10);
        this.standin[i].outValue = i;
        this.standin[i].add(Utils.Utils.sphere(10));
        this.scene.add(this.standin[i]);
      }
      this.light = new THREE.PointLight(16777215);
      this.light.position.copy(this.camera.position);
      this.scene.add(this.light);
      this.counter = 0;
      this.objects = [];
      this.animate3D();
      this.animate2D();
    },
    animate3D: function () {
      this.renderer.render(this.scene, this.camera);
      // requestAnimationFrame(this.animate.bind(this));
      requestAnimationFrame(this.animate3D.bind(this));
    },
    animate2D: function () {
      var that = this;
      this.background();
      this.scene.children.forEach(function (obj) {
        if (typeof obj.outValue !== 'undefined') {
          that.ctx.save();
          that.ctx.beginPath();
          that.ctx.translate(obj.position.x, obj.position.y);
          that.ctx.arc(0, 0, 5, 0, 2 * Math.PI, false);
          that.ctx.fillStyle = '#f000ff';
          that.ctx.fill();
          that.ctx.stroke();
          that.ctx.font = 'bold 16px Arial';
          that.ctx.fillText(obj.outValue, 0, 0);
          that.ctx.restore();
        }
      });
      requestAnimationFrame(this.animate2D.bind(this));
    },
    addEventListeners: function () {
      var that = this;
      this.c.addEventListener('mousedown', function (evt) {
        that._drawLine = true;
        CT.UI.isDrawing = true;
      }, false);
      this.c.addEventListener('mouseup', function (evt) {
        that._drawLine = false;
        CT.UI.isDrawing = false;
        that._moveCtrl = -1;
      }, false);
      this.c.addEventListener('mouseout', function (evt) {
        that._drawLine = false;
        CT.UI.isDrawing = false;
        that._moveCtrl = -1;
        console.log('out');
      }, false);
      this.c.addEventListener('mousemove', function (evt) {
        var mousePos = that.getMousePos(evt);
        if (that._drawLine) {
          var vec = new THREE.Vector3(mousePos.x, mousePos.y, 0);
          var q = 0;
          var q2 = 1;
          for (var i = 0; i < that.standin.length; i++) {
            console.log(vec.distanceTo(that.standin[i].position) < 20);
            if (vec.distanceTo(that.standin[i].position) < 20) {
              q = i + 1;
              if (q > that.standin.length - 1)
                q = 0;
              q2 = i + 2;
              if (q2 > that.standin.length - 1)
                q2 = 0;
              that.standin[i].position.x = mousePos.x;
              that.standin[i].position.y = mousePos.y;
              // that.standin[1].outValue = Math.random();
              that.standin[i].evalCode('x*y', that.standin[q].outValue, that.standin[q2].outValue);
              i = that.standin.length;
            }
          }
        }
      }, false);
    },
    getMousePos: function (evt) {
      var rect = this.c.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    },
    setVectors: function () {
    },
    background: function (color) {
      var col = color || '#558899';
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = col;
      this.ctx.fillRect(0, 0, this.width, this.height);
    },
    drawVectors: function () {
      // this.ctx.clearRect(0, 0, 150, 150);
      // this.ctx.fillStyle = "#558899";
      // this.ctx.fillRect(0, 0, 150, 150);
      for (var i = 1; i < this.vectors.length; i++) {
        this.ctx.beginPath();
        var vec = this.vectors[i - 1];
        this.ctx.lineTo(vec.x, vec.y);
        var vec = this.vectors[i];
        this.ctx.lineTo(vec.x, vec.y);
        this.ctx.stroke();
      }
      for (var i = 0; i < this.ctrls.length; i++) {
        ctx.transform(1, 0, 0, 1, this.ctrls[i].x, this.ctrls[i].y);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      }
    },
    paintColors: function (f) {
      var id = this.ctx.createImageData(this.resX, this.resX);
      // only do this once per page
      var d = id.data;
      // only do this once per page
      var dat = [];
      colors = [];
      var freq = f || 0.03;
      var rand = f * 12 || 1;
      var rand2 = f * 22 || 1;
      for (var i = 0; i < this.resX; i++) {
        for (var j = 0; j < this.resY; j++) {
          // var r = .6+noise(rand+i*.0271,.5+j*.0231,i*.0191)*.5;//(1+Math.cos(i*Math.PI*2/150))/2;
          // var g = .6+noise(rand+i*.021,j*.021,i*.021)*.5;//*((1+Math.cos(Math.PI*2/3+(i*Math.PI*2)/150))/2);
          // var b = .6+noise(rand+i*.031,j*.031,i*.021)*.5;//(1+Math.cos((Math.PI*2/3)*2+(i*Math.PI*2)/150))/2;//(1+Math.cos(((Math.PI*2/3)*2)+(i*Math.PI*2)/150))/2;
          var oi1 = 0.5 + noise(10 + i * freq, 10 + j * freq, freq * j);
          var oi2 = 0.5 + noise(i * freq * rand, j * freq * rand, freq * j);
          //i+.6+noise(rand+j*freq,.5+j*freq,rand+i*freq)*60.5;
          var oi3 = 0.5 + noise((-rand2 + freq + 20 + i) * freq * rand2, (rand2 + 20 + j) * freq * rand2, freq * j);
          //i+.6+noise(rand+j*freq,.5+j*freq,i*freq)*60.5;
          var r = (2 + Math.sin(oi1 * Math.PI * 1.5)) / 3;
          var g = (2 + Math.sin(oi2 * Math.PI * 1.5)) / 3;
          var b = (2 + Math.sin(oi3 * Math.PI * 1.5)) / 3;
          //(1+Math.cos(((Math.PI*2/3)*2)+(i*Math.PI*2)/150))/2;
          var v = 1;
          //((1+Math.cos((j/150)*Math.PI))/2);
          dat.push([
            r * v * 255,
            g * v * 255,
            b * v * 255,
            255
          ]);
        }
      }
      var q = 0;
      for (var i = 0; i < d.length; i++) {
        d[i] = dat[q][0];
        d[++i] = dat[q][1];
        d[++i] = dat[q][2];
        d[++i] = dat[q][3];
        q++;
      }
      d[0] = 0.5;
      d[1] = 0.5;
      d[2] = 0.5;
      d[3] = 0.5;
      // console.log(d);
      this.imageData = dat;
      this.ctx.putImageData(id, 0, 0);
    },
    update: function () {
      if (this._drawLine)
        console.log(this.ctrls);
    }
  };
  return CT;
}(utility_Utils);
main = function (CT) {
  
  // Load any app-specific modules
  // with a relative require call,
  // like:
  // 
  // var THREE = require('../deps/three');
  // var CT = require('core');
  // require('utility/threeExtension');
  // require('utility/Utils');
  // require('objects/CTObject');
  // require('objects/Port');
  // require('objects/Sketch');
  // require('objects/testObject');
  // require('UI/CTUI');
  // CT.ui = new CT.UI();
  // require('objects/testSubObject');
  // require('basicMath');
  console.log('hi');
  window.CT = CT;
  // var UI = require('UI/CTUI');
  // CT.CTUI = new UI(1024,768);
  // CTUI.init();
  return CT;
}(core);
requirejs.config({
  // "baseUrl": "../../src",
  'paths': {
    // "app": "./src",
    'THREE': '../deps/three'
  },
  'shim': { 'THREE': { exports: 'THREE' } }
});
// Load the main app module to start the app
requirejs(['main']);
app = undefined;
}());