const XOH = require('../dist/index.js');
const WebSocket = require('ws');

let x = new XOH.Xapi({
  accountId: "test",
  password: "test Pwd",
  type: "real",
});

x.login();
