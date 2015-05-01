var CH_message_source = null;

CH_sendUDP = function(msg) {
  if(CH_message_source) {
    CH_message_source.postMessage(msg, "*");
  }
}

CH_receiveUDP = function(msg_data) {
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(msg_data,'text/xml');
  var data_descriptions = xmlDoc.getElementsByTagName('DataDescriptions')[0];
  var rigid_body_descriptions = data_descriptions.getElementsByTagName('RigidBody');
  
  var id;
  for (var i = 0; i < rigid_body_descriptions.length; i++) {
    if (rigid_body_descriptions[i].getAttribute('name') === 'wand1') {
      id = rigid_body_descriptions[i].getAttribute('id');
    }
  }
  if (id) {
    var rigid_bodies_array = xmlDoc.getElementsByTagName('RigidBodies')[0];
    var rigid_bodies = rigid_bodies_array.getElementsByTagName('RigidBody');

    for (var i = 0; i < rigid_bodies.length; i++) {
      if (rigid_bodies[i].getAttribute('id') === id) {
        var x = parseFloat(rigid_bodies[i].getAttribute('x'));
        var y = parseFloat(rigid_bodies[i].getAttribute('y'));
        var z = parseFloat(rigid_bodies[i].getAttribute('z'));
        var qx = parseFloat(rigid_bodies[i].getAttribute('qx'));
        var qy = parseFloat(rigid_bodies[i].getAttribute('qy'));
        var qz = parseFloat(rigid_bodies[i].getAttribute('qz'));
        var qw = parseFloat(rigid_bodies[i].getAttribute('qw'));
        moveWand(x, y, z, qx, qy, qz, qw);
      }
    }
  }
};


var messageHandler = function(event) {
var msg_data = event.data;
  if(msg_data == "initialize_webview") {
    // We must initially store the event source for future use.
    CH_message_source = event.source;
    return;
  }
  // UDP data received as msg_data.
  CH_receiveUDP(msg_data);
};

window.addEventListener('message', messageHandler, false);
