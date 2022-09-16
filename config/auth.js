const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//Model de usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")



module.exports = function(passport){

  //passwordField: necessário quando o name do campo for diferente de password
  passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
    Usuario.findOne({email: email}).then((usuario) => {
      if(!usuario){
        return done(null, false, {message: "Esta conta não existe"})
      }

      /** Compara a senha enviada com a senha do usuário encontrada */
      bcrypt.compare(senha, usuario.senha, (erro, senhaIguais) => {
        if(senhaIguais){
          return done(null, usuario)
        }else{
          return done(null, false, {message: "Senha incorreta"})
        }
      })
    })
  }))

  /** Salvar os dados do usuário em uma sessão */
  passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
  })

  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (erro, usuario) => {
      done(erro, usuario)
    })
  })
}