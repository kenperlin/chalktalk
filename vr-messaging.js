var CH_message_source = null;

CH_sendUDP = function(msg) {
  if(CH_message_source) {
    CH_message_source.postMessage(msg, "*");
  }
}

CH_receiveUDP = function(msg_data) {};

var messageHandler = function(event) {
  var msg_data = event.data;
  if(msg_data == "initialize_webview") {
    /* We must initially store the event source for future use. */
    CH_message_source = event.source;
    return;
  }
  /* UDP data received as msg_data. */
  CH_receiveUDP(msg_data);
};

window.addEventListener('message', messageHandler, false);