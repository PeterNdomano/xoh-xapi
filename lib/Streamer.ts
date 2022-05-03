import { WebSocket } from 'ws';
import { createCustomTag } from './helpers';

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

  constructor(args : { streamSessionId: string, host: string }){
    this.streamSessionId = args.streamSessionId;
    this.host = args.host;
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

  public getCandles = ( args: { listener: (data: string) => void, symbol: string } ) => {
    this.registerRequest({
      command: "getCandles",
      listener: args.listener,
    });

    let requestData = {
      command: "getCandles",
      streamSessionId: this.streamSessionId,
      symbol: args.symbol,
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

  public test = (cmd: string) => {
    let requestData = {
      command: cmd,
      streamSessionId: this.streamSessionId,
      symbol: "EURJPY"
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
