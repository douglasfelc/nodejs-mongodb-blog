const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Usuario = new Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  senha: {
    type: String,
    required: true
  },
  administrador: {
    type: Number,
    default: 0,
    comment: '0: Não é administrador, 1: É administrador'
  },
  inclusao: {
    type: Date,
    default: Date.now(),
    comment: 'Data e hora da inclusão'
  }
})

mongoose.model('usuarios', Usuario)