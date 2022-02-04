export interface Account {
  accountId: string;
  password: string;
  type?: string;
  broker?: string;
}

export class Xapi {
  password: string;
  accountId: string;

  constructor(args: Account ) {
    let {
      password,
      accountId,
    } = args;

    this.password = password;
    this.accountId = accountId;
    console.log(this.password);
  }

  init(){
    console.log("Initialized again ....");
  }
}
