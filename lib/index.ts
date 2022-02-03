export class Xapi {
  password: string;
  accountId: string;

  constructor(password: string, accountId: string) {
    this.password = password;
    this.accountId = accountId;
    console.log("Initialized");
  }

  init(){
    console.log("Initialized again ....");
  }
}
