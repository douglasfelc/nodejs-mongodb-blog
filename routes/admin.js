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

  Categoria.find().lean().sort({nome:'asc'}).then((categorias) => {
    resposta.render("admin/categorias", {categorias: categorias})
  }).catch((erro) => {
    console.log("Erro ao listar as categorias "+erro)
    resposta.redirect("/admin")
  })

})

router.get('/categorias/formulario/:id', (requisicao, resposta) => {

  if( requisicao.params.id == 'nova' ){
    global.dados = {id: 'nova'}
  }else{
    Categoria.findOne({_id:requisicao.params.id}).lean().then((categoria) => {
      global.dados = categoria

    }).catch((erro) => {
      console.log("Esta categoria não existe")
      resposta.redirect("/admin/categorias")
    })
  }

  resposta.render("admin/categorias_formulario", {categoria: dados})  
})

router.post('/categorias/salvar', (requisicao, resposta) => {

  var erros = []
  /** Verifica se o nome foi preenchido */
  if( !requisicao.body.nome || typeof requisicao.body.nome == undefined || requisicao.body.nome == null ){
    erros.push({texto: "Nome inválido"})
  }

  /** Verifica se o slug foi preenchido */
  if( !requisicao.body.slug || typeof requisicao.body.slug == undefined || requisicao.body.slug == null ){
    erros.push({texto: "Slug inválido"})
  }

  /** Se tiver erros */
  if(erros.length > 0){
    resposta.render("admin/categorias_formulario", {erros: erros})
  }
  /** Se NÃO tiver erros */
  else{

    /** Se tiver id */
    if( requisicao.body.id ){

      /** Edição */
      Categoria.findOne({_id:requisicao.body.id}).then((categoria) => {
        /** Passa os valores do formulário para o objeto */
        categoria.nome = requisicao.body.nome
        categoria.slug = requisicao.body.slug

        /** Salva o objeto */
        categoria.save().then(() => {
          console.log("Categoria alterada com sucesso")
          resposta.redirect("/admin/categorias")

        }).catch((erro) => {
          console.log("Erro ao alterar a categoria: "+erro)
          resposta.redirect("/admin/categorias")
        })
  
      }).catch((erro) => {
        console.log("Esta categoria não existe: "+erro)
        resposta.redirect("/admin/categorias")
      })

    }else{
      /** Inclui a nova categoria */
      const novaCategoria = {
        nome: requisicao.body.nome,
        slug: requisicao.body.slug
      }

      new Categoria(novaCategoria).save().then(() => {
        resposta.redirect("/admin/categorias")
      }).catch((erro) => {
        console.log("Erro ao salvar a categoria "+erro)
        resposta.redirect("/admin")
      })
    }

  }

})

router.post('/categorias/excluir', (requisicao, resposta) => {
  Categoria.remove({_id: requisicao.body.id}).then(() => {
    console.log("Categoria excluída com sucesso")
    resposta.redirect("/admin/categorias")
  }).catch((erro) => {
    console.log("Erro ao excluir a categoria "+erro)
    resposta.redirect("/admin/categorias")
  })
})

module.exports = router