const mongoose = require('mongoose')
let Schema = mongoose.Schema;

let bcrypt = require('bcrypt')

const chatSchema = new Schema({
    date: {
        type: Date
    },
    order_id: {
        type: String
    },
    to: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    quantity: {
        type: Number
    },
    address: {
        type: String
    },
    price: {
        type: Number
    }
})

const ChatOrders = mongoose.model("ChatOrders", chatSchema)

module.exports = ChatOrders