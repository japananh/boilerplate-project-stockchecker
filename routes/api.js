"use strict";

const axios = require("axios");
const Stock = require("../models");

async function getStockPrice(stock) {
  const url = `https://cloud.iexapis.com/stable/stock/${stock}/quote/latestPrice?token=${process.env.API_TOKEN}`;
  try {
    const result = await axios.get(url);
    if (result) return result.data;
    return;
  } catch (error) {
    console.error("Call api to get price error", JSON.stringify(error));
    return;
  }
}

async function getStock(stock) {
  const stockData = await Stock.findOne({ stock }).lean();
  return stockData;
}

async function updateStock(stock, ip) {
  const stockData = await Stock.updateOne(
    { stock },
    { $push: { ipLikedList: ip } },
    { new: true }
  );
  return stockData;
}

async function addStock({ stock, price, ipLikedList }) {
  const stockData = await Stock.create({
    stock,
    price,
    ipLikedList: ipLikedList || [],
  });
  return stockData.toJSON();
}

module.exports = function (app) {
  app.route("/api/stock-prices").get(async (req, res) => {
    const { stock } = req.query;

    if (!stock) {
      return res.json({ error: "Missing required(s) field" });
    }

    if (typeof stock !== "string" && typeof stock !== "object") {
      return res.json({ error: "Invalid stock" });
    }

    const like = req.query.like === "true" || req.query.like;
    const ip = req.ip;

    // stock in query is a symbol
    if (typeof stock === "string") {
      const stockSymbol = stock.toUpperCase();

      let stockData = await getStock(stockSymbol);

      if (!stockData) {
        const price = await getStockPrice(stockSymbol);

        stockData = await addStock({
          stock: stockSymbol,
          price,
          ipLikedList: like ? [ip] : [],
        });
      } else {
        if (like && !stockData.ipLikedList.includes(ip)) {
          const updatedStock = await updateStock(stock, ip);
          if (updatedStock) stockData.ipLikedList.push(ip);
        }
      }

      if (stockData && stockData.ipLikedList) {
        stockData.likes = stockData.ipLikedList.length;
      }

      delete stockData.ipLikedList;
      delete stockData._id;

      return res.json({ stockData });
    } else {
      // stock in query is an array of symbols
      let stockData = [];

      for (let i = 0; i < stock.length; i++) {
        const stockSymbol = stock[i].toUpperCase();

        let stockInfo = await getStock(stockSymbol);

        if (!stockInfo) {
          const price = await getStockPrice(stockSymbol);

          const newStock = await addStock({
            stock: stockSymbol,
            price,
            ipLikedList: like ? [ip] : [],
          });

          stockInfo = { ...newStock };
        } else {
          if (like && !stockInfo.ipLikedList.includes(ip)) {
            const updatedStock = await updateStock(stockSymbol, ip);
            if (updatedStock) stockInfo.ipLikedList.push(ip);
          }
        }

        if (stockInfo.ipLikedList) {
          stockInfo.likes = stockInfo.ipLikedList.length;
        }

        delete stockInfo.ipLikedList;
        delete stockInfo._id;

        stockData.push(stockInfo);
      }

      if (stockData[0].likes < stockData[1].likes) {
        stockData[0].rel_likes = -1;
        stockData[1].rel_likes = 1;
      } else if (stockData[0].likes > stockData[1].likes) {
        stockData[0].rel_likes = 1;
        stockData[1].rel_likes = -1;
      } else {
        stockData[0].rel_likes = 0;
        stockData[1].rel_likes = 0;
      }

      delete stockData[0].likes;
      delete stockData[1].likes;

      return res.json({ stockData });
    }
  });
};
