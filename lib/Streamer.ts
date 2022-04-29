import { WebSocket } from 'ws';

export interface STREAM_REQUEST {
  customTag: string;
  callback: (data: string) => void;
  command: string;
}

export default class Streamer {
  public streamSessionId: string;
  public host: string;
  public socket: WebSocket;
  public requests: Array<STREAM_REQUEST>;

  constructor(args : { streamSessionId: string, host: string }){
    this.streamSessionId = args.streamSessionId;
    this.host = args.host;
    this.socket = new WebSocket(this.host);
    this.requests = [];
    this.socket.onopen = () => {
      //streaming connection opened
      this.ping();
    }

    this.socket.onmessage = (e) => {
      let data = JSON.parse(<string>e.data);
      console.log(data.customTag);
    }
  }

  public ping = () => {
    let requestData = {
      command: "ping",
      streamSessionId: this.streamSessionId,
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public getBalance = (callback: (data: string) => void ) => {
    let customTag = this.createCustomTag();
    this.registerRequest({
      command: "getBalance",
      customTag: customTag,
      callback,
    });

    let requestData = {
      command: "getBalance",
      streamSessionId: this.streamSessionId,
      customTag: customTag,
    };
    this.socket.send(JSON.stringify(requestData));
  }

  public createCustomTag = () => {
    let tag = new Date().getMilliseconds();
    return String(tag);
  }

  public registerRequest = (request: STREAM_REQUEST) => {
    this.requests.push(request);
  }

  public deleteRequest = (request: STREAM_REQUEST) => {
    //delete request here
  }
}
