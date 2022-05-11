import { WebSocket } from 'ws';

export function createCustomTag(){
  let tag = new Date().getMilliseconds();
  return String(tag);
}


export interface ACCOUNT {
  accountId: string; //trading account ID
  password: string; //trading account password
  type?: string; //can be demo or real (demo)
  broker?: string; //can be xtb or xoh (xtb)
}

export interface REQUEST_BODY {
  command: string; //command to be executed on the server
  arguments?: { }; //arguments for a particular request
  customTag?: string; //Returned exactly as it is by the server
}


export class SocketManager {
  static send = ( webSocket: WebSocket, body: string, customTag: string ) => {
    return (
      new Promise((resolve, reject) => {
        webSocket.send(body);

        webSocket.onmessage = (e) => {

          let response = JSON.parse(<string>e.data);
          if(response.customTag === customTag){
            resolve(e.data);
          }
        }
      })
    );
  }
}

export class Request {
  protected webSocket: WebSocket;
  protected body: REQUEST_BODY;
  protected customTag: string;


  constructor(webSocket: WebSocket, body: REQUEST_BODY ) {
    this.body = body;
    this.webSocket = webSocket;
    this.customTag = createCustomTag();
    //add custom tag
    this.body.customTag = this.customTag;
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
            let response = await SocketManager.send(this.webSocket, body, this.customTag);
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
