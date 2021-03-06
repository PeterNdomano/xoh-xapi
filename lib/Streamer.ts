import WebSocketNoBrowser from 'ws';

import { PERIOD_M15, PERIOD_M1 } from './constants/periods';
import STREAMING_BALANCE_RECORD from './data-formats/StreamingBalanceRecord';
import STREAMING_CANDLE_RECORD from './data-formats/StreamingCandleRecord';
import STREAMING_KEEP_ALIVE_RECORD from './data-formats/StreamingKeepAliveRecord';
import STREAMING_NEWS_RECORD from './data-formats/StreamingNewsRecord';
import STREAMING_PROFIT_RECORD from './data-formats/StreamingProfitRecord';
import STREAMING_TICK_RECORD from './data-formats/StreamingTickRecord';
import STREAMING_TRADE_RECORD from './data-formats/StreamingTradeRecord';
import STREAMING_TRADE_STATUS_RECORD from './data-formats/StreamingTradeStatusRecord';

export interface STREAM_REQUEST {
  symbol?: string;
  listener: (data: unknown) => void;
  command: string;
}

export default class Streamer {
  public streamSessionId: string;
  public host: string;
  public socket: WebSocket | WebSocketNoBrowser;
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

    if(
      typeof process === 'object' &&
      typeof process.versions === 'object' &&
      typeof process.versions.node !== 'undefined'){
        this.socket = new WebSocketNoBrowser(this.host);
    }
    else{
      this.socket = new WebSocket(this.host);
    }
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

         this.socket.onmessage = (e: { data: unknown}) => {
           this.processDataStream(<string>e.data);
         }

         this.socket.onerror = (error: unknown) => {
           this.socketOpen = false;
           rejected("WebSocket error");
         }

         this.socket.onclose = (e: unknown) => {
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
        if( command === "balance"){
          item.listener(<STREAMING_BALANCE_RECORD> response.data);
        }
        else if( command === "candle"){
          item.listener(<STREAMING_CANDLE_RECORD> response.data);
        }
        else if( command === "keepAlive"){
          item.listener(<STREAMING_KEEP_ALIVE_RECORD> response.data);
        }
        else if( command === "news"){
          item.listener(<STREAMING_NEWS_RECORD> response.data);
        }
        else if( command === "profit"){
          item.listener(<STREAMING_PROFIT_RECORD> response.data);
        }
        else if( command === "tickPrices"){
          item.listener(<STREAMING_TICK_RECORD> response.data);
        }
        else if( command === "trade"){
          item.listener(<STREAMING_TRADE_RECORD> response.data);
        }
        else if( command === "tradeStatus"){
          item.listener(<STREAMING_TRADE_STATUS_RECORD> response.data);
        }
        else{
          //just to be safe, reply with unformated data
          item.listener(data);
        }
      }
    } );
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

  public ping = () => {
    let requestData = {
      command: "ping",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public getBalance = ( args: { listener: (data: unknown) => void } ) => {
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

  public getNews = ( args: { listener: (data: unknown) => void } ) => {
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

  public getProfits = ( args: { listener: (data: unknown) => void } ) => {
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

  public getTrades = ( args: { listener: (data: unknown) => void } ) => {
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

  public getTradeStatus = ( args: { listener: (data: unknown) => void } ) => {
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

  public getKeepAlive = ( args: { listener: (data: unknown) => void } ) => {
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

  public getCandles = ( args: { listener: (data: unknown) => void, symbol: string, period?: number } ) => {
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

  public getTickPrices = ( args: { listener: (data: unknown) => void, symbol: string, minArrivalTime?: number, maxLevel?: number, } ) => {
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

  public stopBalance = () => {
    let requestData = {
      command: "stopBalance",
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopCandles = ( args: { symbol: string } ) => {
    let requestData = {
      command: "stopCandles",
      symbol: args.symbol,
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopTickPrices = ( args: { symbol: string } ) => {
    let requestData = {
      command: "stopTickPrices",
      symbol: args.symbol,
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopKeepAlive = () => {
    let requestData = {
      command: "stopKeepAlive",
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopNews = () => {
    let requestData = {
      command: "stopNews",
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopTrades = () => {
    let requestData = {
      command: "stopTrades",
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopTradeStatus = () => {
    let requestData = {
      command: "stopTradeStatus",
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public stopProfits = () => {
    let requestData = {
      command: "stopProfits",
    };
    this.socket.send(JSON.stringify(requestData));
  }
}
