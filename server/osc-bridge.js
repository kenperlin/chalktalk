const OSC = require('osc-js')
 
const config = { udpClient: { port: 9129 } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
 
osc.open() // start a WebSocket server on port 8080
