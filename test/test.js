const XOH = require('../dist/index.js');

let x = new XOH.Xapi({
  accountId: "13356926",
  password: "DemoTest123",
  type: "demo",
  broker: "xtb",
});

x.onReady(() => {
  console.log('Welcome');
  x.getAllSymbols().then((data) => {
    console.log('getting symbols....');
    console.log(data);
  }, (error) => {
    console.log(error.message);
  });
}, (error) => {
  console.log(error.message);
});
