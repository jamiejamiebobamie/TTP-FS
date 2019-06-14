const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");
var uniqueValidator = require('mongoose-unique-validator');
var slugify = require('slugify');

const StockSchema = new Schema({
  symbol: { type: String, required: true, unique: true },
  quote: { type: Number, required: false },
  news: { type: String, required: false},
  shares : { type: Number, required: false},
  priceAtPurchase : { type: Number, required: false}
});


// Always populate the author field
StockSchema
    .pre('findOne', Populate('quote'))
    .pre('find', Populate('quote'))

module.exports = mongoose.model("Stock", StockSchema);
