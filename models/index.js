const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const stockSchema = mongoose.Schema(
  {
    stock: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    ipLikedList: {
      type: Array,
      required: true,
      default: [],
    },
  },
  {
    // timestamps: true,
    versionKey: false,
  }
);

// add plugin that converts mongoose to json
stockSchema.plugin(toJSON);

/**
 * @typedef Library
 */
const Library = mongoose.model("Stock", stockSchema);

module.exports = Library;
