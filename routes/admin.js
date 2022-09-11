const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")


router.get('/', (requisicao, resposta) => {
  resposta.render("admin/index")
})

router.get('/posts', (requisicao, resposta) => {
  resposta.send("Página de posts")
})

router.get('/categorias', (requisicao, resposta) => {
  resposta.render("admin/categorias")
})

router.get('/categorias/adicionar', (requisicao, resposta) => {
  resposta.render("admin/categorias_adicionar")
})

router.post('/categorias/nova', (requisicao, resposta) => {
  const novaCategoria = {
    nome: requisicao.body.nome,
    slug: requisicao.body.slug
  }

  new Categoria(novaCategoria).save().then(() => {
    console.log("Categoria salva com sucesso")
  }).catch((erro) => {
    console.log("Erro ao salvar a categoria "+erro)
  })
})

module.exports = router