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


export class SocketManager(){

}

export class Request {
  protected body: REQUEST_BODY;

  constructor(body: REQUEST_BODY ) {
    this.body = body;
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
  private streamSessionId: string;
  private loginStatus: boolean;
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
      else if(this.type === 'real'){
        this.host = "wss://ws.xapi.pro/real";
      }
      else{
        this.host = null;
      }
    }
    else if(this.broker === 'xtb'){
      if(this.type === 'demo'){
        this.host = "wss://ws.xtb.com/demo";
      }
      else if(this.type === 'real'){
        this.host = "wss://ws.xtb.com/real";
      }
      else{
        this.host = null;
      }
    }
    else{
      this.host = null;
    }

  }

  private login(){
    let request = new Request(this.host, { command: "login", arguments: { "userId": 2} })
    request.send();
  }
}
