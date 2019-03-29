
function() {
   this.label = 'Arc';
   this.tooltip = 'ARC OF A CIRCLE:\n\n\u2022 Click to toggle radii\n\u2022 Cmd-click to vary labeling\n\u2022 Drag on ends to vary angles';
   this.angle = [0, PI / 4];
   this.showRadii = true;
   this.labelsMode = false;
   this.onCmdClick = ['toggle labels', function() { this.labelsMode = (this.labelsMode + 1) % 4; }];
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
      if (this.labelsMode > 0) {
         textHeight(this.mScale(.07));
	 var pt0 = this.pt(this.angle[1]);
	 var ptm = this.pt((this.angle[0] + this.angle[1]) / 2);
	 var pt1 = this.pt(this.angle[0]);
	 mText('A', [pt0[0] * 1.1, pt0[1] * 1.1]);
	 mText('B', [pt1[0] * 1.1, pt1[1] * 1.1]);
	 switch (this.labelsMode) {
	 case 2: mText('|A| |B| cos(angle)', [ptm[0] * .2, ptm[1] * .2]); break;
	 case 3: mText('cos(angle)', [ptm[0] * .2, ptm[1] * .2]); break;
	 }
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
