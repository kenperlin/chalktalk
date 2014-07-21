["] ]!]#]$]%]&]'](](])]*]+],]-].^/^0^1^2^3^4^4^5^6^7^8^9^:^;_<_=_>^?^@^A^A^B^C^D^E^F^G^H^I^J^K^L^M^N^O^O^P^Q^R^S^T^U^V^W^X^Y^Z^[^]^]^^^_^`^a^b^c^d^e^f]g]h]i]j]j]k]l]m]n]o]p]q]r]s]t]u]v[w[w[x[y[z[{[|[}[~","]&[%Y&X&W&U&T&S%R%P%O%N%M%K%J%I%G%F%E&D&B&A&A&A'A)A*A+A-A.A/A0A2A3A4A5A7B8B9B;B<B=B>B@BABBBCBEBFBGBIBJBKBLBNBOBPBQBSCTCUCVCXCYCZC]C^C_C`CbCcCdCeCgChCiCkClCmCnCoEoFoGoHnJnKnLnNnOnPnQnSnTnUnVnXnYnZo[o^o"]

THREE.Object3D.prototype.addTube = function(p, nSegments) {
  var points = [];
  for (var i = 0 ; i < p.length ; i++)
     points.push( new THREE.Vector3( p[i][0],p[i][1],p[i][2] ) );
  var geometry = tubeGeometry( points, nSegments );
  var mesh = new THREE.Mesh(geometry, blackMaterial);
  this.add(mesh);
  return mesh;
}

function tubeGeometry(points, n) {
  var curve = new THREE.SplineCurve3(points);
  return new THREE.TubeGeometry(curve, n,.1);
}
