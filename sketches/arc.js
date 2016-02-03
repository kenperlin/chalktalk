
function() {
   this.label = 'arc';
   this.angle = [0, PI / 4];
   this.showRadii = true;
   this.onClick = ['toggle radii', function() { this.showRadii = ! this.showRadii; }];
   this.pt = function(angle) { return [ cos(angle), sin(angle) ]; }
   this.onPress = function(p) {
      p = [p.x, p.y];
      this.dragId = distance(p, this.p[0]) < distance(p, this.p[1]) ? 0 : 1;
      this.p0 = p;
   }
   this.onDrag = function(p) {
      p = [p.x, p.y];
      this.angle[this.dragId] += dot([p[1] - this.p0[1], this.p0[0] - p[0]], this.p[this.dragId]);
      this.p0 = p;
   }
   this.render = function() {
      this.p = [this.pt(this.angle[0]), this.pt(this.angle[1])];
      if (this.showRadii) {
         mLine([0,0], this.p[0]);
         mLine([0,0], this.p[1]);
      }
      this.afterSketch(function() {
         var c = [], n = floor(10 * max(1, abs(this.angle[1] - this.angle[0]))), i;
         for (i = 0 ; i <= n ; i++)
            c.push(this.pt(mix(this.angle[0], this.angle[1], i / n)));
         mCurve(c);
      });
   }
   this.output = function() { return this.angle[1] - this.angle[0]; }
}
