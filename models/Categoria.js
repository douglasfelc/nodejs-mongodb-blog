const mongoose = require("mongoose")
const Schema = mongoose.Schema


const Categoria = new Schema({
  nome: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  inclusao: {
    type: Date,
    default: Date.now(),
    comment: 'Data e hora da inclusão'
  }
})

mongoose.model('categorias', Categoria)