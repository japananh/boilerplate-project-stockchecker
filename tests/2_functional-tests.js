const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("Test GET request to /api/stock-prices", () => {
    test("Viewing one stock", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "GOOG" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.isObject(
            res.body.stockData,
            "response should have a property stockData as an object"
          );
          assert.isNumber(
            res.body.stockData.likes,
            "stockData should have likes as a number"
          );
          assert.isString(
            res.body.stockData.stock,
            "stockData should have stock as a string"
          );

          if (res.body.stockData.price != null) {
            assert.isNumber(
              res.body.stockData.price,
              "stockData should have price as a number"
            );
          }

          done();
        });
    });

    let likes = 0;
    const stock = "GOOG";

    test("Viewing one stock and liking it", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock, like: "true" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.isObject(
            res.body.stockData,
            "response should have a property stockData as an object"
          );
          assert.isString(
            res.body.stockData.stock,
            "stockData should have stock as a string"
          );
          assert.isAtLeast(
            res.body.stockData.likes,
            1,
            "stockData should have likes greater or equal to 1"
          );

          likes = res.body.stockData.likes;

          if (res.body.stockData.price != null) {
            assert.isNumber(
              res.body.stockData.price,
              "stockData should have price as a number"
            );
          }

          done();
        });
    });

    test("Viewing the same stock and liking it again", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock, like: "true" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "response should have stockData"
          );
          assert.isObject(res.body.stockData, "stockData should be an object");
          assert.containsAllKeys(
            res.body.stockData,
            ["stock", "likes"],
            "stockData should have stock and likes keys"
          );
          assert.isNumber(
            res.body.stockData.likes,
            "stockData should have likes as a number"
          );
          assert.equal(
            res.body.stockData.likes,
            likes,
            "stockData should remain the same likes number"
          );

          done();
        });
    });

    test("Viewing two stocks", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["GOOG", "MSFT"] })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.isArray(
            res.body.stockData,
            "response should have a property stockData as an array"
          );

          res.body.stockData.forEach((item) => {
            assert.isObject(item, "stockData should be an array of objects");
            assert.isString(item.stock, "stock should be a string");
            assert.equal(
              item.stock,
              item.stock.toUpperCase(),
              "each item in stockData should have stock as uppercase letters"
            );
            assert.isNumber(
              item.rel_likes,
              "each item in stockData should have rel_likes as a number"
            );
          });

          done();
        });
    });

    test("Viewing two stocks and liking them", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["GOOG", "MSFT"], like: "true" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.isArray(
            res.body.stockData,
            "response should have a property stockData as an array"
          );

          res.body.stockData.forEach((item) => {
            assert.isObject(item, "stockData should be an array of objects");
            assert.isNumber(
              item.rel_likes,
              "each item in stockData should have rel_likes as a number"
            );
            assert.equal(
              item.stock,
              item.stock.toUpperCase(),
              "each item in stockData should have stock is uppercase"
            );
          });

          done();
        });
    });
  });
});
