const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

//Pega somente a função administrador
const {administrador} = require("../helpers/administrador")


/** Rota principal */
router.get('/', administrador, (requisicao, resposta) => {
  resposta.render("admin/index")
})


/** Usuários */
router.get('/usuarios', administrador, (requisicao, resposta) => {

  Usuario.find().lean().sort({nome:'asc'}).then((usuarios) => {
    resposta.render("admin/usuarios", {usuarios: usuarios})
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro ao listar as usuarios, tente novamente mais tarde.")
    console.log("Erro ao listar as usuarios "+erro)
    resposta.redirect("/admin")
  })

})

//Excluir via _GET
router.get('/usuarios/excluir/:id', administrador, (requisicao, resposta) => {

  Usuario.deleteOne({_id: requisicao.params.id}).then(() => {
    requisicao.flash("mensagemSucesso", "Usuário excluído com sucesso")
    resposta.redirect("/admin/usuarios")
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro ao excluir o usuário")
    console.log("Erro ao excluir o usuário "+erro)
    resposta.redirect("/admin/usuarios")
  })

})

//Alterar o tipo do usuário: administrador ou membro
router.post('/usuarios/administrador', administrador, (requisicao, resposta) => {

  Usuario.findOne({_id:requisicao.body.id}).then((usuario) => {
    /** Passa os valores do formulário para o objeto */
    usuario.administrador = requisicao.body.administrador

    /** Salva o objeto */
    usuario.save().then(() => {
      requisicao.flash("mensagemSucesso", "Usuário alterado com sucesso!")
      resposta.redirect("/admin/usuarios")

    }).catch((erro) => {
      requisicao.flash("mensagemErro", "Houve um erro ao alterar o usuário")
      console.log("Erro ao alterar o usuário: "+erro)
      resposta.redirect("/admin/usuarios")
    })

  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Este usuário não existe")
    console.log("Este usuário não existe: "+erro)
    resposta.redirect("/admin/usuarios")
  })

})



/** Categorias */
router.get('/categorias', administrador, (requisicao, resposta) => {

  Categoria.find().lean().sort({nome:'asc'}).then((categorias) => {
    resposta.render("admin/categorias", {categorias: categorias})
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro ao listar as categorias, tente novamente mais tarde.")
    console.log("Erro ao listar as categorias "+erro)
    resposta.redirect("/admin")
  })

})

router.get('/categorias/formulario/:id', administrador, (requisicao, resposta) => {

  /** Se for nova postagem */
  if( requisicao.params.id == 'nova' ){
    var categoria = {id: 'nova'}
    resposta.render("admin/categorias_formulario", {categoria: categoria})
  }
  /** Senão, é edição */
  else{
    Categoria.findOne({_id:requisicao.params.id}).lean().then((categoria) => {
      resposta.render("admin/categorias_formulario", {categoria: categoria})

    }).catch((erro) => {
      requisicao.flash("mensagemErro", "Esta categoria não existe.")
      console.log("Esta categoria não existe: "+erro)
      resposta.redirect("/admin/categorias")
    })
  }

})

router.post('/categorias/salvar', administrador, (requisicao, resposta) => {

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
          requisicao.flash("mensagemSucesso", "Categoria alterada com sucesso!")
          resposta.redirect("/admin/categorias")

        }).catch((erro) => {
          requisicao.flash("mensagemErro", "Houve um erro ao alterar a categoria")
          console.log("Erro ao alterar a categoria: "+erro)
          resposta.redirect("/admin/categorias")
        })
  
      }).catch((erro) => {
        requisicao.flash("mensagemErro", "Esta categoria não existe")
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
        requisicao.flash("mensagemSucesso", "Categoria criada com sucesso")
        resposta.redirect("/admin/categorias")
      }).catch((erro) => {
        requisicao.flash("mensagemErro", "Houve um erro ao salvar a categoria. Tente novamente")
        console.log("Erro ao salvar a categoria: "+erro)
        resposta.redirect("/admin")
      })
    }

  }

})

//Excluir via _POST
router.post('/categorias/excluir', administrador, (requisicao, resposta) => {
  Categoria.deleteOne({_id: requisicao.body.id}).then(() => {
    requisicao.flash("mensagemSucesso", "Categoria excluída com sucesso")
    resposta.redirect("/admin/categorias")
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro ao excluir a  categoria")
    console.log("Erro ao excluir a categoria "+erro)
    resposta.redirect("/admin/categorias")
  })
})



/** Postagens */
router.get('/postagens', administrador, (requisicao, resposta) => {

  /** Postagem com as categorias do campo "categoria" */
  Postagem.find().populate("categoria").lean().sort({nome:'asc'}).then((postagens) => {
    resposta.render("admin/postagens", {postagens: postagens})
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro ao listar as postagens, tente novamente mais tarde.")
    console.log("Erro ao listar as postagens "+erro)
    resposta.redirect("/admin")
  })

})

router.get('/postagens/formulario/:id', administrador, (requisicao, resposta) => {

  /** Se for nova postagem */
  if( requisicao.params.id == 'nova' ){

    Categoria.find().lean().then((categorias) => {
      var postagem = {id: 'nova'}
      resposta.render("admin/postagens_formulario", {postagem: postagem, categorias: categorias})

    }).catch((erro) => {
      requisicao.flash("mensagemErro", "Houve um erro ao carregar as categorias")
      resposta.redirect("/admin")
    })

  }
  /** Senão, é edição */
  else{

    Categoria.find().lean().then((categorias) => {
      Postagem.findOne({_id:requisicao.params.id}).lean().then((postagem) => {
        resposta.render("admin/postagens_formulario", {postagem: postagem, categorias: categorias})
  
      }).catch((erro) => {
        requisicao.flash("mensagemErro", "Esta postagem não existe.")
        console.log("Esta postagem não existe: "+erro)
        resposta.redirect("/admin/postagens")
      })

    }).catch((erro) => {
      requisicao.flash("mensagemErro", "Houve um erro ao carregar as categorias")
      resposta.redirect("/admin")
    })

  }

})

router.post('/postagens/salvar', administrador, (requisicao, resposta) => {

  var erros = []
  /** Verifica se o titulo foi preenchido */
  if( !requisicao.body.titulo || typeof requisicao.body.titulo == undefined || requisicao.body.titulo == null ){
    erros.push({texto: "Título inválido"})
  }

  /** Verifica se o slug foi preenchido */
  if( !requisicao.body.slug || typeof requisicao.body.slug == undefined || requisicao.body.slug == null ){
    erros.push({texto: "Slug inválido"})
  }

  /** Verifica se a descrição foi preenchido */
  if( !requisicao.body.descricao || typeof requisicao.body.descricao == undefined || requisicao.body.descricao == null ){
    erros.push({texto: "Descrição inválida"})
  }

  /** Verifica se o conteúdo foi preenchido */
  if( !requisicao.body.conteudo || typeof requisicao.body.conteudo == undefined || requisicao.body.conteudo == null ){
    erros.push({texto: "Conteúdo inválido"})
  }

  /** Verifica se tem categoria */
  if( !requisicao.body.categoria || typeof requisicao.body.categoria == undefined || requisicao.body.categoria == null || requisicao.body.categoria == 0 ){
    erros.push({texto: "Nenhuma categoria foi selecionada"})
  }

  /** Se tiver erros */
  if(erros.length > 0){
    resposta.render("admin/postagens_formulario", {erros: erros})
  }
  /** Se NÃO tiver erros */
  else{

    /** Se tiver id */
    if( requisicao.body.id ){

      /** Edição */
      Postagem.findOne({_id:requisicao.body.id}).then((postagem) => {
        /** Passa os valores do formulário para o objeto */
        postagem.titulo = requisicao.body.titulo
        postagem.slug = requisicao.body.slug
        postagem.descricao = requisicao.body.descricao
        postagem.conteudo = requisicao.body.conteudo
        postagem.categoria = requisicao.body.categoria

        /** Salva o objeto */
        postagem.save().then(() => {
          requisicao.flash("mensagemSucesso", "Postagem alterada com sucesso!")
          resposta.redirect("/admin/postagens")

        }).catch((erro) => {
          requisicao.flash("mensagemErro", "Houve um erro ao alterar a postagem")
          console.log("Erro ao alterar a postagem: "+erro)
          resposta.redirect("/admin/postagens")
        })
  
      }).catch((erro) => {
        requisicao.flash("mensagemErro", "Esta postagem não existe")
        console.log("Esta postagem não existe: "+erro)
        resposta.redirect("/admin/postagens")
      })

    }else{
      /** Inclui a nova postagem */
      const novaPostagem = {
        titulo: requisicao.body.titulo,
        slug: requisicao.body.slug,
        descricao: requisicao.body.descricao,
        conteudo: requisicao.body.conteudo,
        categoria: requisicao.body.categoria
      }

      new Postagem(novaPostagem).save().then(() => {
        requisicao.flash("mensagemSucesso", "Postagem criada com sucesso")
        resposta.redirect("/admin/postagens")
      }).catch((erro) => {
        requisicao.flash("mensagemErro", "Houve um erro ao salvar a postagem. Tente novamente")
        console.log("Erro ao salvar a postagem: "+erro)
        resposta.redirect("/admin")
      })
    }

  }

})

//Excluir via _GET
router.get('/postagens/excluir/:id', administrador, (requisicao, resposta) => {
  Postagem.deleteOne({_id: requisicao.params.id}).then(() => {
    requisicao.flash("mensagemSucesso", "Postagem excluída com sucesso")
    resposta.redirect("/admin/postagens")
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro ao excluir a postagem")
    console.log("Erro ao excluir a postagem "+erro)
    resposta.redirect("/admin/postagens")
  })
})


module.exports = router