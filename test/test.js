const XOH = require('../dist/index.js');

let x = new XOH.Xapi({
  accountId: "13356926",
  password: "DemoTest123",
  type: "demo",
  broker: "xtb",
});


x.onReady(() => {
  console.log('Welcome');
}, (error) => {
  console.log(error.message);
});

console.log('second way.....');
(
  async () => {
    await x.init();
    let data = await x.getAllSymbols();
    console.log(data[2]);
  }
)();
console.log('second way end.....');
