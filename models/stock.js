const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");
var uniqueValidator = require('mongoose-unique-validator');
var slugify = require('slugify');

const StockSchema = new Schema({
  symbol: { type: String, required: false, unique: false, },
  priceAtPurchase: { type: Number, required: false, unique: false, },
  news: { type: String, required: false, unique: false, },
  quantity : { type: Number, required: false, unique: false, },
  action: { type: String, required: false, unique: false, },
  owner: { type: Schema.Types.ObjectId, ref: "User", unique: false, sparse: true }
});

// // Always populate the author field
// StockSchema
//     .pre('findOne', Populate('quote'))
//     .pre('find', Populate('quote'))

module.exports = mongoose.model("Stock", StockSchema);
