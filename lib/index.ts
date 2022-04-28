import { WebSocket } from 'ws';
import { SYMBOL_RECORD } from './data-formats/SymbolRecord';


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
  static send = ( webSocket: WebSocket, body: string ) => {
    return (
      new Promise((resolve, reject) => {
        webSocket.send(body);

        webSocket.onmessage = (e) => {
          resolve(e.data);
        }
      })
    );
  }
}

export class Request {
  protected webSocket: WebSocket;
  protected body: REQUEST_BODY;


  constructor(webSocket: WebSocket, body: REQUEST_BODY ) {
    this.body = body;
    this.webSocket = webSocket;
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
            let response = await SocketManager.send(this.webSocket, body);
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
  private webSocket: WebSocket;

  /**
   * Main Object for API communication
   * @constructor
   */
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
    this.loginStatus = false;


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

    //set websocket
    this.webSocket = new WebSocket(this.host);
  }


  /**
   * Used to start session with the server
   * @param {Function} onReady - Function to run when everything is ready
   * @param {Function} onError - Function to run when errors happen during initialization with Error object carrying the message
   */
  private onReady = (onReady: Function, onError: Function) => {
    if(this.loginStatus){
      onReady();
    }
    else{
      this.webSocket.onopen = () => {
        this.login().then(
          (data) => {
            //login success
            let response = JSON.parse(<string>data);
            if(response.status === true){
              onReady();
            }
            else{
              onError( new Error(response.errorCode+": "+response.errorDescr) );
            }
          },
          (error) => {
            //error in login process
            onError(error);
          }
        );
      }

      this.webSocket.onerror = (e) => {
        this.loginStatus = false;
        onError(e.message);
      }

      this.webSocket.onclose = (e) => {
        this.loginStatus = false;
        onError(new Error("Communication to the server was closed"));
      }
    }
  }


  /**
   * Used for login to the trading server
   */
  private login = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "login",
          arguments: {
            "userId": this.accountId,
            "password": this.password
          }
        })
        request.send().then(
          (data) => {
            //fulfilled
            let response = JSON.parse(<string>data);
            if(response.status === true){
              this.streamSessionId = response.streamSessionId;
              this.loginStatus = true;
            }
            resolved(data)
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }


  /**
   * Logs out the user/client
   */
  private logOut = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "logout"
        })
        request.send().then(
          (data) => {
            //fulfilled
            resolved(data)
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  /**
   * Returns array of all symbols available for the user
   */
  private getAllSymbols = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getAllSymbols"
        })
        request.send().then(
          (data) => {
            //fulfilled
            resolved(data)
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  /**
   * Returns calendar with market events
   */
  private getCalendar = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getCalendar"
        })
        request.send().then(
          (data) => {
            //fulfilled
            resolved(data)
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

}
