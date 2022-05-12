const Xapi = require('../dist/index.js').default;

let x = new Xapi({
  accountId: "",
  password: "",
  type: "demo",
  broker: "xtb",
});


x.onReady(async () => {
  console.log("welcome....");
  await x.streamer.init(); //remember to init streamer before using it
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

}, (error) => {
  console.log("error: "+error.message);
})

/* OR
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
