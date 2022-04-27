import { WebSocket } from 'ws';


export interface ACCOUNT {
  accountId: string; //trading account ID
  password: string; //trading account password
  type?: string; //can be demo or real (demo)
  broker?: string; //can be xtb or xoh (xtb)
}

export interface REQUEST_BODY {
  command: string; //command to be executed on the server
  arguments?: { }; //arguments for a particular request
  customTag?: number; //Returned exactly as it is by the server
}


export class SocketManager {
  protected host: string;
  protected webSocket: WebSocket;

  constructor(host: string){
    this.host = host;
    this.webSocket = new WebSocket(this.host);
  }


  send = ( body: string ) => {
    return (
      new Promise((resolve, reject) => {
        this.webSocket.onopen = () => {
          this.webSocket.send(body);
        }

        this.webSocket.onmessage = (e) => {
          resolve(e.data);
        }

        this.webSocket.onerror = (error) => {
          reject(error);
        }
      })
    );
  }
}

export class Request {
  protected body: REQUEST_BODY;
  protected socketManager: SocketManager;

  constructor(socketManager: SocketManager, body: REQUEST_BODY ) {
    this.body = body;
    this.socketManager = socketManager;
  }

  isValid(){
    if(this.body.command.trim().length > 0 ){
      return true;
    }
    return false;
  }

  send = () => {
    return (
      new Promise(async (resolve, reject) => {
        if(this.isValid()){
          try{
            let body = JSON.stringify(this.body);
            let response = await this.socketManager.send(body);
            resolve(response);
          }
          catch(e){
            reject(e);
          }
        }
        else{
          reject(new Error('Invalid request body or url'));
        }
      })
    );
  }
}

export class Xapi {
  private password: string;
  private accountId: string;
  private type: string;
  private broker: string;
  private streamSessionId?: string;
  private loginStatus?: boolean;
  private host: string;
  private socketManager: SocketManager;

  constructor(args: ACCOUNT ) {
    let {
      password,
      accountId,
      type = 'demo',
      broker = 'xtb' ,
    } = args;

    this.password = password;
    this.accountId = accountId;
    this.type = (type === 'demo' || type === 'real') ? type : 'demo';
    this.broker = (broker === 'xoh' || broker === 'xtb') ? broker : 'xtb';

    //set host url
    if(this.broker === 'xoh'){
      if(this.type === 'demo'){
        this.host = "wss://ws.xapi.pro/demo";
      }
      else{
        this.host = "wss://ws.xapi.pro/real";
      }
    }
    else{
      if(this.type === 'demo'){
        this.host = "wss://ws.xtb.com/demo";
      }
      else{
        this.host = "wss://ws.xtb.com/real";
      }
    }

    //setup asocket manager
    this.socketManager = new SocketManager(this.host);

    this.login();

  }

  private login = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.socketManager, { command: "login", arguments: { "userId": 2} })
        request.send().then(
          (response) => {
            resolved(response)
          },
          (error) => {
            rejected(error);
          }
        )
      })
    );
  }
}
