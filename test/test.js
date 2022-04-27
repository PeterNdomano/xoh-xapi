const XOH = require('../dist/index.js');

let x = new XOH.Xapi({
  accountId: "test",
  password: "test Pwd",
  type: "real",
});

(
  async () => {
    let response = await x.login();
    console.log(response);
  }
)();
