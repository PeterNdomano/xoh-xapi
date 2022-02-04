export interface ACCOUNT {
  accountId: string;
  password: string;
  type?: string;
  broker?: string;
}

export interface REQUEST_BODY {
  command: string;
  arguments?: { };
  customTag?: number;
}


export class SocketManager {
  protected host: string;
  protected webSocket: WebSocket;

  constructor(host: string){
    this.host = host;
    this.webSocket = new WebSocket(this.host);

    this.webSocket.onopen = function(e){
      console.log('Connected to the server');
    };

    this.webSocket.onmessage = function(e){
      console.log(e.data);
    }
  }


  send( body: string ){
    this.webSocket.send(body);
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

  send(){
    let sender = new Promise((resolve, reject) => {
      if(this.isValid()){
        try{
          let body = JSON.stringify(this.body);
          this.socketManager.send(body);
        }
        catch(e){
          reject(e);
        }
      }
      else{
        reject(new Error('Invalid request body or url'));
      }
    })

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

  private login(){
    let request = new Request(this.socketManager, { command: "login", arguments: { "userId": 2} })
    request.send();
  }
}
