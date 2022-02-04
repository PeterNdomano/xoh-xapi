export interface Account {
  accountId: string;
  password: string;
  type?: string;
  broker?: string;
}

export class Xapi {
  private password: string;
  private accountId: string;
  private type: string;
  private broker: string;
  private sessionId: string;

  constructor(args: Account ) {
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

  }

  init(){
    console.log("Initialized again ....");
  }
}
