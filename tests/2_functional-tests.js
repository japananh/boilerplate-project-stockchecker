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
        .query({ stock: "goOg" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "response should have stockData"
          );
          assert.isObject(res.body.stockData, "stockData should be an object");
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

    test("Viewing one stock and liking it", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goOg", like: "true" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "response should have stockData"
          );
          assert.isObject(res.body.stockData, "stockData should be an object");
          assert.isString(
            res.body.stockData.stock,
            "stockData should have stock as a string"
          );
          assert.isAtLeast(
            res.body.stockData.likes,
            1,
            "stockData should have likes greater or equal to 1"
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

    test("Viewing the same stock and liking it again", (done) => {
      const stock = "vnm";

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
          assert.isNumber(
            res.body.stockData.likes,
            "stockData should have likes as a number"
          );

          const oldLikes = res.body.stockData.likes;

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
              assert.isObject(
                res.body.stockData,
                "stockData should be an object"
              );
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
                oldLikes,
                "stockData should remain the same likes number"
              );
              done();
            });
        });
    });

    test("Viewing two stocks", (done) => {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goOg", "VNM"] })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "response should have stockData"
          );
          assert.isArray(res.body.stockData, "stockData should be an array");

          res.body.stockData.forEach((item) => {
            assert.isObject(item, "stockData should be an array of objects");
            assert.containsAllKeys(item, ["stock", "rel_likes"]);
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
        .query({ stock: ["vNm", "goog"], like: "true" })
        .end((_err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "response should have stockData"
          );
          assert.isArray(res.body.stockData, "stockData should be an array");

          res.body.stockData.forEach((item) => {
            assert.isObject(item, "stockData should be an array of objects");
            assert.containsAllKeys(
              item,
              ["stock", "rel_likes"],
              "each item in stockData should contain stock and rel_likes"
            );
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
