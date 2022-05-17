# xoh-xapi


![regulation-xtb](https://user-images.githubusercontent.com/28900892/168629204-a19f491b-8b14-44e9-bcb7-34d10c11a6b8.jpg)

![xoh-xapi](https://user-images.githubusercontent.com/28900892/168625800-c132b7a2-5444-48ee-b638-c1e0483de3c5.png)


### XTB and X Open Hub API
This Javascript/Typescript API can be used to communicate with Forex Trading servers of XTB and X Open Hub for various purposes including, but not limited to
* Opening and Closing Positions
* Getting Market Data and Candlestick Data
* Fetching Market News & Calendar
* Many more........

Give that capability, xoh-xapi is a great tool for creating Trading Bots and Indicators to help making right decisions in Forex, Crypto and Stock Trading 

### How to install
This API works for both browser and non-browser javascript environments.
Install it by running `npm install xoh-xapi`
Then Import it in your Project by running  `import Xapi from 'xoh-xapi'`


### How to use
First you must create an instance of Xapi by:
```js
let x = new Xapi({
    accountId: "<your_account_id>", //you can get a demo account ID from XTB
    password: "<your_password>", //Your account password
    type: "<acc_type>", //account type, can be 'demo' or 'real'
    broker: "<broker>", // your broker, currently only 'xtb' (for XTB) and 'xoh' for X Open Hub are supported
  });
  
```

After creating an instance of xoh-xapi you must initialize it before you can use it otherwise it'll throw websocket exceptions. The initialization performs login process automatically so no need to call `Xapi.login()` method explicitly.
You can initialize it in two ways. Either by using `x.init()` or by using `x.onReady(successCallback(), failureCallback());`. Let's see both ways below.

#### Initializing with Xapi.init()
Note `x` is our `Xapi` instance here and this API is Promise Based. So you initialize it like below..
```js
(
  async () => {
    await x.init();
    
    //then you can use it like this
    await x.getAllSymbols().then((symbols) => {
      console.log('symbols data...');
      console.log(symbols[0]);
    })
  }
)();
```

#### Initializing with Xapi.onReady( success(), fail(<Error> error))
This is the most recomended way to initialize this API because it gives you more control on how to handle Startup errors.
Note `x` is our `Xapi` instance here. So you initialize it like below..
```js
x.onReady(async () => {
  console.log("welcome....");
  await x.getCalendar().then((cal) => {
    console.log('calendar data');
    console.log(cal[0]);
  })
}, (error) => {
  //error is an instance of JS Error Object
  console.log("error: "+error.message);
})
```
  
After initialization you can perform all actions using the api as [described here](http://developers.xstore.pro/documentation/)

#### STreaming commands (Get Real time data as it arrive on the server)
In order to do this you must first initialize the streamer of Xapi instance by `Xapi.streamer.init()` as follows.
Note: the initialization method is a Promise-based function
```js
x.onReady(async () => {
  console.log("welcome....");
  await x.streamer.init(); //streamer initialized here.
  
  x.streamer.getKeepAlive({
    listener: (data) => {
      console.log('it works....');
      console.log(data);
    }
  })

}, (error) => {
  console.log("error: "+error.message);
})
```
There are various streaming functions like Xapi.streamer.getKeepAlive(), Xapi.streamer.getCandles() and many others as [described here](http://developers.xstore.pro/documentation/).
But something is common for all of these functions. Firstly they are not promise based (except the init() function) and they all take an object
as a parameter consisting of a listener filed that references the function which should be run whenever new streaming data is sent from the server.
Other object fields may be for symbols and other function specific parameters.


### Format of Response Data:
This API replies with Purely Javascript Objects, so there's no need to Parse, you may only Stringfy the response data if you want to have them as JSON instead. Consider the example below.

```js
x.onReady(async () => {
  console.log("welcome....");
  await x.streamer.init(); //remember to init streamer before using it
  await x.getCalendar().then((cal) => {
    //here cal holds array of Objects extending CALENDAR_RECORD interface( found in data-formats/CalendarRecord.ts)
    console.log('calendar data');
    console.log(cal[0]); //logging first calendar event
    console.log(cal[0].title); //getting title of the first calendar event
  })
}, (error) => {
  console.log("error: "+error.message);
})
```
The same way is also used in streaming commands
  
  
### Features:
* Typescript support
* Persists connection to the server behind the scenes untill user calls Xapi.logout() method, no need to manually ping in order to stay connected to the server
* Promise Based API
* With manual communication to XTB or X Open Hub Servers some streaming commands do not work without triggering (eg getCandles), But this API handles everything behind the scenes so user can just call any streaming and non-streaming command with ease and without worrying about such issues.
* The project is under constant development
* Easy to use!
  
### Whats next?
Currently I'm working on integrating some kind of storage so that Apps using this API can opt to save data and process it later offline.
  
### Contribution.
Welcome to open Issues and submit PRs.
