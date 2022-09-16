const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/login", (requisicao, resposta) => {
  resposta.render("usuario/login", {layout: 'login'})
})

router.post("/login", (requisicao, resposta, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/usuario/login",
    failureFlash: true
  })(requisicao, resposta, next)
})

router.get('/logout', (requisicao, resposta, next) => {
  requisicao.logout(function(erro) {
    if (erro) {
      requisicao.flash("mensagemErro", "Erro ao efetuar o logoff")
      console.log("Erro ao efetuar o logoff: "+erro)
      return next(erro)
    }

    requisicao.flash("mensagemSucesso", "Logoff efetuado com sucesso")
    resposta.redirect('/')
  })
})

router.get("/cadastro", (requisicao, resposta) => {
  resposta.render("usuario/cadastro")
})

router.post('/salvar', (requisicao, resposta) => {

  var erros = []
  /** Verifica se o nome foi preenchido */
  if( !requisicao.body.nome || typeof requisicao.body.nome == undefined || requisicao.body.nome == null ){
    erros.push({texto: "Nome inválido"})
  }

  /** Verifica se o email foi preenchido */
  if( !requisicao.body.email || typeof requisicao.body.email == undefined || requisicao.body.email == null ){
    erros.push({texto: "E-mail inválido"})
  }

  /** Verifica se a senha foi preenchida */
  if( !requisicao.body.senha || typeof requisicao.body.senha == undefined || requisicao.body.senha == null ){
    erros.push({texto: "Senha inválida"})
  }
  /** Verifica se a senha é muito curta */
  else if(requisicao.body.senha.length < 4){
    erros.push({texto: "Senha muito fraca. A senha deve possuir pelo menos 4 caracteres"})
  }
  /** Verifica se as senhas foram digitadas iguais */
  else if(requisicao.body.senha != requisicao.body.senha2){
    erros.push({texto: "As senhas informadas são diferentes, tente novamente"})
  }

  /** Se tiver erros */
  if(erros.length > 0){
    resposta.render("usuario/cadastro", {erros: erros})
  }
  /** Se NÃO tiver erros */
  else{

    /** Se tiver id */
    if( requisicao.body.id ){

      /** Edição */
      Usuario.findOne({_id:requisicao.body.id}).then((categoria) => {
        /** Passa os valores do formulário para o objeto */
        categoria.nome = requisicao.body.nome
        categoria.email = requisicao.body.email
        categoria.senha = requisicao.body.senha

        /** Salva o objeto */
        categoria.save().then(() => {
          requisicao.flash("mensagemSucesso", "Usuário alterado com sucesso!")
          resposta.redirect("/admin/categorias")

        }).catch((erro) => {
          requisicao.flash("mensagemErro", "Houve um erro ao alterar o usuário")
          console.log("Erro ao alterar o usuário: "+erro)
          resposta.redirect("/admin/categorias")
        })
  
      }).catch((erro) => {
        requisicao.flash("mensagemErro", "Este usuário não existe")
        console.log("Este usuário não existe: "+erro)
        resposta.redirect("/admin/categorias")
      })

    }else{

      /** Verifica se o usuário já não tem cadastro */
      Usuario.findOne({email: requisicao.body.email}).then((usuario) => {
        /** Se já tem usuário cadastro */
        if(usuario){
          requisicao.flash("mensagemErro", "Já existe uma conta com este e-mail")
          resposta.redirect("/usuario/cadastro")
        }
        /** Se não tiver usuário */
        else{
          /** Inclui a novo usuário */
          const novoUsuario = new Usuario({
            nome: requisicao.body.nome,
            email: requisicao.body.email,
            senha: requisicao.body.senha,
          })

          /** Encriptar a senha */
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if(erro){
                requisicao.flash("mensagemErro", "Houve um erro durante o cadastro do usuário")
                console.log("Erro durante o hash: "+erro)
                resposta.redirect("/")
              }else{
                /** Preencha a senha com o hash */
                novoUsuario.senha = hash

                novoUsuario.save().then(() => {
                  requisicao.flash("mensagemSucesso", "Usuário criado com sucesso")
                  resposta.redirect("/")
                }).catch((erro) => {
                  requisicao.flash("mensagemErro", "Houve um erro ao salvar o usuário. Tente novamente")
                  console.log("Erro ao salvar o usuário: "+erro)
                  resposta.redirect("/usuario/cadastro")
                })
              }
            })
          })
          
        }
      }).catch((erro) => {
        //requisicao.flash("mensagemErro", "Houve um erro ao verificar usuário")
        resposta.redirect("/")
      })

    }

  }

})


module.exports = router