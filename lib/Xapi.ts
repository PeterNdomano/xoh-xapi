import WebSocketNoBrowser from 'ws';

import SYMBOL_RECORD from './data-formats/SymbolRecord';
import CALENDAR_RECORD from './data-formats/CalendarRecord';
import CHART_LAST_INFO_RECORD from './data-formats/ChartLastInfoRecord';
import RATE_INFO_RECORD from './data-formats/RateInfoRecord';
import CHART_RANGE_INFO_RECORD from './data-formats/ChartRangeInfoRecord';
import IB_RECORD from './data-formats/IbRecord';
import NEWS_TOPIC_RECORD from './data-formats/NewsTopicRecord';
import STEP_RULE_RECORD from './data-formats/StepRuleRecord';
import TICK_RECORD from './data-formats/TickRecord';
import TRADE_RECORD from './data-formats/TradeRecord';
import TRADING_HOURS_RECORD from './data-formats/TradingHoursRecord';
import TRADE_TRANS_INFO from './data-formats/TradeTransInfo';
import COMMISSION_DEF from './data-formats/CommissionDef';
import CURRENT_USER_DATA from './data-formats/CurrentUserData';
import MARGIN_LEVEL from './data-formats/MarginLevel';
import MARGIN_TRADE from './data-formats/MarginTrade';
import PROFIT from './data-formats/Profit';
import SERVER_TIME from './data-formats/ServerTime';
import VERSION from './data-formats/Version';
import Streamer from './Streamer';
import { ACCOUNT, Request } from './helpers';



export default class Xapi {
  private password: string;
  private accountId: string;
  private type: string;
  private broker: string;
  private streamSessionId?: string;
  private loginStatus?: boolean;
  private host: string;
  private hostStream: string;
  private webSocket: WebSocket | WebSocketNoBrowser;
  private pingTimerId?: unknown;
  private streamer?: Streamer;

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
        this.hostStream = "wss://ws.xapi.pro/demoStream";
      }
      else{
        this.host = "wss://ws.xapi.pro/real";
        this.hostStream = "wss://ws.xapi.pro/realStream";
      }
    }
    else{
      if(this.type === 'demo'){
        this.host = "wss://ws.xtb.com/demo";
        this.hostStream = "wss://ws.xtb.com/demoStream";
      }
      else{
        this.host = "wss://ws.xtb.com/real";
        this.hostStream = "wss://ws.xtb.com/realStream";
      }
    }

    //set websocket
    if(
      typeof process === 'object' &&
      typeof process.versions === 'object' &&
      typeof process.versions.node !== 'undefined'){
        this.webSocket = new WebSocketNoBrowser(this.host);
    }
    else{
      this.webSocket = new WebSocket(this.host);
    }
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

      this.webSocket.onerror = (e: unknown) => {
        this.loginStatus = false;
        onError("Websocket error");
      }

      this.webSocket.onclose = (e: unknown) => {
        this.loginStatus = false;
        onError(new Error("Communication to the server was closed"));
      }
    }
  }


  /**
   * Used to initiate connection to the server separately other than using onReady
   */
  private init = () => {
    return (
      new Promise(( resolved, rejected ) => {
        if(this.loginStatus){
          resolved(true);
        }
        else{
          this.webSocket.onopen = () => {
            this.login().then(
              (data) => {
                //login success
                let response = JSON.parse(<string>data);
                if(response.status === true){
                  resolved(true);
                }
                else{
                  rejected( new Error(response.errorCode+": "+response.errorDescr) );
                }
              },
              (error) => {
                //error in login process
                rejected(error);
              }
            );
          }

          this.webSocket.onerror = (e: unknown) => {
            this.loginStatus = false;
            rejected("Websocket Error");
          }

          this.webSocket.onclose = (e: unknown) => {
            this.loginStatus = false;
            rejected(new Error("Communication to the server was closed"));
          }
        }
      })
    );
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
              this.streamer = new Streamer({
                streamSessionId: <string>this.streamSessionId,
                host: this.hostStream,
                candlesTrigger: this.getChartLastRequest,
                candlesTrigger2: this.getChartRangeRequest,
              });

              //ping after every 30 secs to keep connection alive
              this.pingTimerId =  setInterval( async () => {
                await this.ping(); //can be set to stream version of ping
              }, 10000);
              resolved(data)
            }
            else{
              rejected( new Error("Cannot Login to the server") );
            }

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
            //clear the ping timer if set
            if(!(this.pingTimerId === undefined)){
              clearInterval(<number>this.pingTimerId);
            }

            resolved(true)
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
  private  getAllSymbols = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getAllSymbols"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<SYMBOL_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
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
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<CALENDAR_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
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
   * Returns chart info, from start date to the current time.
   */
  private getChartLastRequest = (info : CHART_LAST_INFO_RECORD) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getChartLastRequest",
          arguments: {
            info,
          }
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<RATE_INFO_RECORD>> response.returnData.rateInfos); //skipped digits from response.returnData.digits
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getChartRangeRequest = (info : CHART_RANGE_INFO_RECORD) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getChartRangeRequest",
          arguments: {
            info,
          }
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<RATE_INFO_RECORD>> response.returnData.rateInfos); //skipped digits from response.returnData.digits
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getCommissionDef = ( args : {symbol: string, volume: number}) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getCommissionDef",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <COMMISSION_DEF>response.returnData );
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getCurrentUserData = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getCurrentUserData"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <CURRENT_USER_DATA>response.returnData );
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getIbsHistory = ( args: {end: number, start: number}) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getIbsHistory",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<IB_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getMarginLevel = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getMarginLevel"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <MARGIN_LEVEL>response.returnData );
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getMarginTrade = ( args: {symbol: string, volume: number}) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getMarginTrade",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <MARGIN_TRADE>response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getNews = ( args: {end?: number, start: number}) => {
    return (
      new Promise((resolved, rejected) => {
        args.end = (args.end === undefined) ? 0 : args.end;
        let request = new Request(this.webSocket, {
          command: "getNews",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<NEWS_TOPIC_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getProfitCalculation = ( args: { closePrice: number, cmd: number, openPrice: number, symbol: string, volume: number }) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getProfitCalculation",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <PROFIT>response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getServerTime = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getServerTime"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <SERVER_TIME>response.returnData );
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getStepRules = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getStepRules"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<STEP_RULE_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getSymbol = ( args : {symbol: string}) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getSymbol",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<SYMBOL_RECORD> response.returnData );
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getTickPrices = ( args : { level: number, symbols: Array<string>, timestamp: number } ) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getTickPrices",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<TICK_RECORD>> response.returnData.quotations);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getTradeRecords = ( args : { orders: Array<string> } ) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getTradeRecords",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<TRADE_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getTrades = ( args : { openedOnly?: boolean, } ) => {
    return (
      new Promise((resolved, rejected) => {
        args.openedOnly = (args.openedOnly === undefined) ? false : args.openedOnly;
        let request = new Request(this.webSocket, {
          command: "getTrades",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<TRADE_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getTradesHistory = ( args : { end?: number, start: number } ) => {
    return (
      new Promise((resolved, rejected) => {
        args.end = (args.end === undefined) ? 0 : args.end;
        let request = new Request(this.webSocket, {
          command: "getTradesHistory",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<TRADE_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getTradingHours = ( args : { symbols : Array<string> } ) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getTradingHours",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(<Array<TRADING_HOURS_RECORD>> response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private getVersion = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "getVersion"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( <VERSION>response.returnData );
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private ping = () => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "ping"
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved( true );
            }
            else{
              rejected( new Error(response.errorCode+": "+response.errorDescr) );
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private tradeTransaction = (info : TRADE_TRANS_INFO) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "tradeTransaction",
          arguments: {
            tradeTransInfo: info,
          }
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(response.returnData); //orderId
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
          },
          (error) => {
            //failed
            rejected(error);
          }
        )
      })
    );
  }

  private tradeTransactionStatus = ( args: { order: number}) => {
    return (
      new Promise((resolved, rejected) => {
        let request = new Request(this.webSocket, {
          command: "tradeTransactionStatus",
          arguments: args,
        })
        request.send().then(
          (data) => {
            let response = JSON.parse(<string>data);
            if(response.status === true){
              resolved(response.returnData);
            }
            else{
              rejected(new Error(response.errorCode+": "+response.errorDescr));
            }
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
