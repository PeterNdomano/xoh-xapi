const XOH = require('../dist/index.js');

let x = new XOH.Xapi({
  accountId: "13356926",
  password: "DemoTest123",
  type: "demo",
  broker: "xtb",
});

x.onReady(async () => {
  console.log("welcome....");
  await x.streamer.init(); //remember to iit streamer before using it
  x.streamer.getCandles({
    listener: (data) => {
      console.log('it works.... data is:'+data);
      //console.log(data);
    },
    symbol: "EURUSD",
    period: 5,
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
