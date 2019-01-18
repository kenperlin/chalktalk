// index.js
// Created by Aaron C Gaudette on 10.01.17

'use_strict';

// Server
const dgram = require('dgram');
const os = require('os');
const sizeof = require('object-sizeof');

// Protocol
const fs = require('fs');
const flatbuffers = require('acg-flatbuffers');
const protocol = flatbuffers.compileSchema(
  fs.readFileSync(__dirname + '/holojam.bfbs')
);

// Events
const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

// Entry
module.exports = (
  mode = ['relay', 'web'],
  serverAddress = '0.0.0.0',
  webPort = 9593, upstreamPort = 9592, downstreamPort = 9591,
  multicastAddress = '239.0.2.4'
) => { return new Holojam(
  mode, serverAddress, webPort, upstreamPort, downstreamPort, multicastAddress
);};

var Holojam = function(
  mode, serverAddress, webPort, upstreamPort, downstreamPort, multicastAddress
){
  const relay = mode.includes('relay');
  const web = mode.includes('web');

  // Relay mode overrides emitter + sink mode
  const sending = relay || mode.includes('emitter');
  const receiving = relay || mode.includes('sink');

  // Unicast
  let sendAddress = serverAddress, sendPort = upstreamPort;
  // Multicast
  if(relay){ sendAddress = multicastAddress, sendPort = downstreamPort; }

  // Metrics
  let packetsSent = [0,0], packetsReceived = [0,0];
  let bytesSent = [0,0], bytesReceived = [0,0];
  let events = 0;

  // Initialize
  const udp = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  // Relay receives upstream
  if(relay)
    udp.bind(upstreamPort, serverAddress);
  // Emitter + sink (client) receives downstream
  else if(receiving)
    udp.bind(downstreamPort, () => udp.addMembership(multicastAddress));
  EventEmitter.call(this);

  if(!sending && !receiving)
    throw new Error('Invalid mode passed to constructor!'
      + ' (Try \'relay\', \'emitter\', or \'sink\')');

  console.log('Holojam: Initialized,',
    relay? 'relay' :
    (!relay && sending && receiving)? 'emitter + sink' :
    sending? 'emitter' : 'sink',
    web? '(with web support)' : '(without web support)'
  );

  if(sending) console.log(
    'Holojam: Sending to', (relay? multicastAddress + ':' + downstreamPort :
    serverAddress + ':' + upstreamPort)
  );

  udp.on('listening', () => {
    if(receiving) console.log('Holojam: Listening',
      (relay? 'at ' + serverAddress + ':' + upstreamPort :
      'to ' + multicastAddress + ':' + downstreamPort)
    );
  });

  udp.on('error', (error) => {
    console.log('Holojam:');
    console.log(error);
    udp.close();
  });

  if(receiving){
    udp.on('message', (buffer, info) => {
      var data = relay? // Route if relay
        this.SendRaw(buffer) : this.Decode(buffer);

      // Update events
      if(data.type == 'UPDATE'){
        this.emit('update', data.flakes, data.scope, data.origin);
        this.emit('update-raw', buffer, info);

      // Holojam event
      }else if(data.type == 'EVENT'){
        this.emit(
          data.flakes[0].label, data.flakes[0],
          data.scope, data.origin
        );
        events++;
      }

      packetsReceived[0]++;
      bytesReceived[0] += buffer.length;
    });
  }

  // Emit nuggets
  const Emit = (nugget, buffer) => {
    if(!sending) return;

    udp.send(buffer, 0, buffer.length,
      sendPort, sendAddress,
      (error, bytes) => { if(error) throw error; }
    );
    if(web) this.SendToWeb(nugget);

    packetsSent[0]++;
    bytesSent[0] += buffer.length;
  }

  this.Send = function(nugget){
    let buffer = this.Encode(nugget);
    Emit(nugget, buffer);
    return buffer;
  };

  this.SendRaw = function(buffer){
    let nugget = this.Decode(buffer);
    Emit(nugget, buffer);
    return nugget;
  };

  // Web
  if(web){
    const io = require('socket.io')();
    io.listen(webPort, (error) => { if(error){
      console.log('Holojam:');
      console.log(error);
    }});
    console.log('Holojam: Web server on *:' + webPort);

    if(receiving){
      io.on('connection', (client) => {
        // Listen for packets back from the web
        client.on('relay', (nugget) => {
          // Feed web data into the normal stream (if relay)
          if(relay) this.Send(nugget);
          // Update event
          if(nugget.type == 'UPDATE')
            this.emit('update', nugget.flakes, nugget.scope, nugget.origin);
          // Holojam event
          else if(nugget.type == 'EVENT'){
            this.emit(
              nugget.flakes[0].label, nugget.flakes[0],
              nugget.scope, nugget.origin
            );
            events++;
          }

          packetsReceived[1]++;
          bytesReceived[1] += sizeof(nugget);
        });
      });
    }

    // Emit nuggets to web
    this.SendToWeb = function(nugget){
      if(!sending) return;
      io.emit('message', nugget);

      packetsSent[1]++;
      bytesSent[1] += sizeof(nugget);
    };
  }

  // Protocol

  const BuildPacket = function(scope, type, flakes){
    return {
      scope: scope, origin: os.userInfo()['username'] + '@' + os.hostname(),
      type: type, flakes: flakes
    };
  }

  this.BuildUpdate = (scope = 'Node', flakes) =>
    BuildPacket(scope, 'UPDATE', flakes);

  this.BuildEvent = (scope = 'Node', flake) =>
    BuildPacket(scope, 'EVENT', [flake]);
  this.BuildNotification = (scope = 'Node', label = 'Notification') =>
    BuildPacket(scope, 'EVENT', [{label: label}]);

  // Metrics
  setInterval(() => {
    this.emit('tick',
      packetsSent, packetsReceived,
      bytesSent, bytesReceived, [
        parseInt(
          (bytesSent[0] + bytesReceived[0]) / (packetsSent[0] + packetsReceived[0])),
        parseInt(
          (bytesSent[1] + bytesReceived[1]) / (packetsSent[1] + packetsReceived[1]))
      ],
      events
    );
    packetsSent = [0,0]; packetsReceived = [0,0];
    bytesSent = [0,0]; bytesReceived = [0,0];
    events = 0;
  },1000);
};
inherits(Holojam,EventEmitter);

//Protocol <-> JSON conversion
Holojam.prototype.Encode = (nugget) => Buffer.from(protocol.generate(nugget));
Holojam.prototype.Decode = (buffer) => protocol.parse(buffer);
