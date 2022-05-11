import { WebSocket } from 'ws';
import { createCustomTag } from './helpers';
import { PERIOD_M15, PERIOD_M1 } from './constants/periods';

export interface STREAM_REQUEST {
  symbol?: string;
  listener: (data: string) => void;
  command: string;
}

export default class Streamer {
  public streamSessionId: string;
  public host: string;
  public socket: WebSocket;
  public requests: Array<STREAM_REQUEST>;
  public socketOpen?: boolean;
  public pingTimerId?: unknown;
  public candlesTrigger: Function;
  public candlesTrigger2: Function;

  constructor(args : { streamSessionId: string, host: string, candlesTrigger: Function, candlesTrigger2: Function }){
    this.streamSessionId = args.streamSessionId;
    this.host = args.host;
    this.candlesTrigger = args.candlesTrigger;
    this.candlesTrigger2 = args.candlesTrigger2;
    this.socketOpen = false;
    this.socket = new WebSocket(this.host);
    this.requests = [];

    (
      async () => {
        await this.init();
      }
    )();
  }

  public init = () => {
    return (
      new Promise((resolved, rejected) => {
       if(this.socketOpen === false){
         this.socket.onopen = () => {
           this.socketOpen = true;

           //ping after every 10 secs to keep connection alive
           this.pingTimerId =  setInterval( async () => {
             this.ping(); //can be set to stream version of ping
           }, 10000);
           resolved(true);
         }

         this.socket.onmessage = (e) => {
           this.processDataStream(<string>e.data);
         }

         this.socket.onerror = (error) => {
           this.socketOpen = false;
           rejected(error);
         }

         this.socket.onclose = (e) => {
           this.socketOpen = false;
           rejected(new Error("Streaming connection closed"));
         }

       }
       else{
         resolved(true);
       }
     })
   );
  }

  public processDataStream = (data: string) => {
    let response = JSON.parse(data);
    let command = response.command;
    let symbol = response.data.symbol;
    this.requests.forEach( (item, index) => {
      if(item.command === command && item.symbol === symbol){
        item.listener(data);
      }
    } );
  }

  public ping = () => {
    let requestData = {
      command: "ping",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public getBalance = ( args: { listener: (data: string) => void } ) => {
    this.registerRequest({
      command: "balance",
      listener: args.listener,
    });

    let requestData = {
      command: "getBalance",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public getNews = ( args: { listener: (data: string) => void } ) => {
    this.registerRequest({
      command: "news",
      listener: args.listener,
    });

    let requestData = {
      command: "getNews",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public getProfits = ( args: { listener: (data: string) => void } ) => {
    this.registerRequest({
      command: "profit",
      listener: args.listener,
    });

    let requestData = {
      command: "getProfits",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public getTrades = ( args: { listener: (data: string) => void } ) => {
    this.registerRequest({
      command: "trade",
      listener: args.listener,
    });

    let requestData = {
      command: "getTrades",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public getTradeStatus = ( args: { listener: (data: string) => void } ) => {
    this.registerRequest({
      command: "tradeStatus",
      listener: args.listener,
    });

    let requestData = {
      command: "getTradeStatus",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public getKeepAlive = ( args: { listener: (data: string) => void } ) => {
    this.registerRequest({
      command: "keepAlive",
      listener: args.listener,
    });

    let requestData = {
      command: "getKeepAlive",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public getCandles = ( args: { listener: (data: string) => void, symbol: string, period?: number } ) => {
    this.registerRequest({
      command: "candle",
      listener: args.listener,
      symbol: args.symbol,
    });

    let requestData = {
      command: "getCandles",
      streamSessionId: this.streamSessionId,
      symbol: args.symbol,
    };

    (
      async () => {

        //runs the first trigger
        let triggerData = await this.candlesTrigger({
          symbol: args.symbol,
          start: ((new Date().getTime()) - (1000 * (60 * 60))),
          period: ((args.period === undefined) ? PERIOD_M1 : args.period),
        });

        //runs the second trigger
        let triggerData2 = await this.candlesTrigger2({
          symbol: args.symbol,
          start: ((new Date().getTime()) - (1000 * (60 * 60))),
          end: (new Date().getTime()),
          period: ((args.period === undefined) ? PERIOD_M1 : args.period),
        });
        
        this.socket.send(JSON.stringify(requestData));
      }
    )();

  }

  public getTickPrices = ( args: { listener: (data: string) => void, symbol: string, minArrivalTime?: number, maxLevel?: number, } ) => {
    this.registerRequest({
      command: "tickPrices",
      listener: args.listener,
      symbol: args.symbol,
    });

    let requestData = {
      command: "getTickPrices",
      streamSessionId: this.streamSessionId,
      symbol: args.symbol,
      minArrivalTime: ((args.minArrivalTime === undefined) ? 0 : args.minArrivalTime),
      maxLevel: ((args.maxLevel === undefined) ? 2 : args.maxLevel),
    };

    this.socket.send(JSON.stringify(requestData));

  }

  public keepAlive = () => {
    let requestData = {
      command: "getKeepAlive",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));

  }

  public registerRequest = (request: STREAM_REQUEST) => {
    this.requests.push(request);
  }

  public deleteRequest = (request: STREAM_REQUEST) => {
    //delete request here
    let command = request.command;
    let symbol = request.symbol;
    this.requests.forEach( (item, index) => {
      if(item.command === command && item.symbol === symbol){
        this.requests.splice(index, 1);
      }
    } );
  }
}
