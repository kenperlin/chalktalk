/*
   Convenience routines to handle conversion between geometry and its xml description.
*/

function XMLGraph(name, type) {
   this.name = name;
   this.type = type;
   this.modification_version = 0;
   this.clear();

   this.fields = {};
   this.fields.Ball = 'x y z r'.split(' ');
   this.fields.Link = 'a b ra rb'.split(' ');
}

XMLGraph.prototype = {
   clear : function() {
      this.objs = [];
   },

   setBall : function(id, p, r) {
      if (this.objs[id] === undefined)
         this.objs[id] = ['Ball'];
      this.objs[id][1] = p.x;
      this.objs[id][2] = p.y;
      this.objs[id][3] = p.z;
      this.objs[id][4] = r;
   },

   setLink : function(id, a, b, w) {
      if (this.objs[id] === undefined)
         this.objs[id] = ['Link'];
      this.objs[id][1] = a;
      this.objs[id][2] = b;
      this.objs[id][3] = w * this.objs[a][4];
      this.objs[id][4] = w * this.objs[b][4];
   },

   toString : function() {
      var s = '<Balls>\n';
      var anyLinks = false;
      for (var i = 0 ; i < this.objs.length ; i++) {
         var obj = this.objs[i];
	 var type = obj[0];
	 if (! anyLinks && type == 'Link') {
	    s += '</Balls>\n';
	    s += '<Links>\n';
	    anyLinks = true;
	 }
         s += '<' + type + ' id="' + i + '" ';
	 var f = this.fields[type];
	 for (var j = 0 ; j < f.length ; j++) {
	    var key = f[j];
	    var val = obj[1 + j];
	    if (key != 'a' && key != 'b')
	       val = roundedString(val, -3);
            s += key + '="' + val + '" ';
         }
         s += '/>\n';
      }
      s += '</Links>\n'

      if (s != this.s) {
         this.s = s;
         this.modification_version++;
      }

      return '<Update'
           + ' id="' + this.name + '"'
           + ' type="' + (this.type === undefined ? 'null' : this.type) + '"'
	   + ' modification_version="' + this.modification_version + '"'
	   + ' time="' + (new Date().getTime()) + '"'
	   + '>'
	   + s
           + '</Update>\n';
   },
}

