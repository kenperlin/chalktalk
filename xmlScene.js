/*
   Convenience routines to handle conversion between geometry and its xml description.
*/

function XMLScene(name) {
   this.name = name;
   this.clear();

   this.fields = {};
   this.fields.ball = 'x y z r'.split(' ');
   this.fields.link = 'a b ra rb'.split(' ');
}

XMLScene.prototype = {
   clear : function() {
      this.objs = [];
   },

   setBall : function(id, p, r) {
      if (this.objs[id] === undefined)
         this.objs[id] = ['ball'];
      this.objs[id][1] = p.x;
      this.objs[id][2] = p.y;
      this.objs[id][3] = p.z;
      this.objs[id][4] = r;
   },

   setLink : function(id, a, b, w) {
      if (this.objs[id] === undefined)
         this.objs[id] = ['link'];
      this.objs[id][1] = a;
      this.objs[id][2] = b;
      this.objs[id][3] = w * this.objs[a][4];
      this.objs[id][4] = w * this.objs[b][4];
   },

   toString : function() {
      var s = '';
      s += '<client'
               + ' id="'   + this.name + '"'
	       + ' time="' + (new Date()).getTime() + '"'
	       + '>\n'
	       + '<balls>\n';
      var anyLinks = false;
      for (var i = 0 ; i < this.objs.length ; i++) {
         var obj = this.objs[i];
	 var type = obj[0];
	 if (! anyLinks && type == 'link') {
	    s += '</balls>\n';
	    s += '<links>\n';
	    anyLinks = true;
	 }
         s += '<' + type + ' id="' + i + '" ';
	 var f = this.fields[type];
	 for (var j = 0 ; j < f.length ; j++) {
	    var key = f[j];
	    var val = obj[1 + j];
	    if (key != 'a' && key != 'b')
	       val = roundedString(val, -4);
            s += key + '="' + val + '" ';
         }
         s += '/>\n';
      }
      s += '</links>\n'
         + '</client>\n';
      return s;
   },
}

