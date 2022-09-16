module.exports = {
  /** Define o administrador: */
  administrador: function(requisicao, resposta, next){

    /** Verifica se está autenticado e é um administrador */
    if(requisicao.isAuthenticated() && requisicao.user.administrador == 1){
      return next()
    }

    requisicao.flash("mensagemErro", "Você deve estar logado como administrador")
    resposta.redirect("/")
  }
}