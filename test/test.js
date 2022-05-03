const XOH = require('../dist/index.js');

let x = new XOH.Xapi({
  accountId: "13356926",
  password: "DemoTest123",
  type: "demo",
  broker: "xtb",
});

x.onReady(() => {
  console.log("welcome....");
  x.streamer.getKeepAlive({
    listener: (data) => {
      console.log('it works....');
      console.log(data);
    }
  })
}, (error) => {
  console.log("error: "+error.message);
})

/*
(
  async () => {
    await x.init();
    await x.getAllSymbols().then((symbols) => {
      console.log('symbols data');
      console.log(symbols[0]);
    })

    await x.getCalendar().then((cal) => {
      console.log('calendar data');
      console.log(cal[0]);
    })

    x.streamer.getKeepAlive({
      listener: (data) => {
        console.log('it works....');
        console.log(data);
      }
    })
  }

)();
*/
