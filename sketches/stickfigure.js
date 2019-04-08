function() {
   this.label = 'stickfigure';
/*
   this.onClick = ['gender', () => this.setProp('isFemale', ! this.prop('isFemale'))];
   this.props = { isFemale: false };
   this.render = () => {
      mStickFigure([0,0],1, this.prop('isFemale'));
   }
*/
   this.onClick = [ 'gender', () => this.isFemale = ! this.isFemale ];
   this.isFemale = false;
   this.render = () => mStickFigure([0,0],1, this.isFemale);
}
