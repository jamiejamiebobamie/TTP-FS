const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");
var uniqueValidator = require('mongoose-unique-validator');
var slugify = require('slugify');

const StockSchema = new Schema({
  symbol: { type: String },
  priceAtPurchase: { type: Number },
  news: { type: String },
  quantity : { type: Number },
  action: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  color: {type: String },
  priceAtStartOfDay: { type: Number },
  priceNow: {type: Number },
  value: {type: Number }
});

// // Always populate the author field
// StockSchema
//     .pre('findOne', Populate('quote'))
//     .pre('find', Populate('quote'))

module.exports = mongoose.model("Stock", StockSchema);
