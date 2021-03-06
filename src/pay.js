class Payir {
  constructor(api) {
    if (api != "" && typeof api === "string") {
      this.request = require("request");
      this.api = api;
      this.sendEndPoint = "https://pay.ir/payment/send";
      this.verifyEndPoint = "https://pay.ir/payment/verify";
      this.gateway = "https://pay.ir/payment/gateway/";
    } else
      throw new Error(
        "You should pass your Pay.ir API Key to the constructor."
      );
  }

  send(amount, callbackURL, factorNumber) {
    const $this = this;
    factorNumber = factorNumber || null;
    return new Promise((resolve, reject) => {
      if (typeof amount !== "number" || amount < 1000)
        throw new Error(
          "Transaction's amount must be a number and equal/greater than 1000"
        );
      else if (typeof callbackURL !== "string" || callbackURL.length < 5)
        throw new Error("Callback (redirect) URL must be a string.");
      else if (callbackURL.slice(0, 4) != "http")
        throw new Error("Callback URL must start with http/https");
      this.request.post(
        {
          url: this.sendEndPoint,
          form: { api: $this.api, amount, redirect: callbackURL, factorNumber },
        },
        (error, response, body) => {
          if (error) reject(error.code);
          else if (response.statusCode != 200)
            reject(new Error("Request status code was not OK."));
          else if (typeof body != "undefined" && JSON.parse(body).status != 1)
            reject(JSON.parse(body).errorMessage);
          resolve(this.gateway + JSON.parse(body).transId);
        }
      );
    });
  }

  verify(requestBody) {
    const $this = this;
    let transId = parseInt(requestBody.transId);
    return new Promise((resolve, reject) => {
      if (!transId || typeof transId !== "number")
        throw new Error("Transaction ID is not valid.");

      this.request.post(
        {
          url: this.verifyEndPoint,
          form: { api: this.api, transId },
        },
        (error, response, body) => {
          if (error) reject(error.code);
          else if (response.statusCode != 200)
            reject(new Error("Request status code was not OK."));
          else if (typeof body != "undefined" && JSON.parse(body).status != 1)
            reject(JSON.parse(body).errorMessage);
          resolve({
            amount: JSON.parse(body).amount,
            cardNumber: requestBody.cardNumber,
            transactionId: transId,
            factorNumber: requestBody.factorNumber,
          });
        }
      );
    });
  }
}

module.exports = Payir;
