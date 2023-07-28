const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  magazines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magazine',
  }]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;