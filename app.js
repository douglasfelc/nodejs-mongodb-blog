/** Importando módulos */
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const admin = require("./routes/admin")

const session = require("express-session")
const flash = require("connect-flash")

require("./models/Postagem")
const Postagem = mongoose.model("postagens")

/** Instanciar o express */
const app = express()


/** Configurações */
//Sessão
app.use(
  session({
    secret: "j7h5_pv3!u$9",
    resave: true,
    saveUninitialized: true
  })
)
app.use(flash())

//Middleware
app.use((requisicao, resposta, next) => {
  /** Variáveis globais */
  resposta.locals.mensagemSucesso = requisicao.flash("mensagemSucesso")
  resposta.locals.mensagemErro = requisicao.flash("mensagemErro")

  next(); //continuar requisição
})

app.use(express.static(__dirname + '/public/'))
app.use('/scripts', express.static(__dirname + '/node_modules/jquery/dist/'))
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/js/'))

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.engine('handlebars', handlebars.engine(
  {defaultLayout: 'main',
  helpers:{
    ifCond: (v1, operator, v2, options) => {

      /** Se o v1 e v2 não estiverem definidos */
      if( !v1 || typeof v1 == undefined || v1 == null
       || !v2 || typeof v2 == undefined || v2 == null ){
        return false
      }else{
        v1 = v1.toString()
        v2 = v2.toString()

        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      }

    }
  }
}) );
app.set('view engine', 'handlebars')

mongoose.Promise = global.Promise
mongoose.connect(
  "mongodb://"+
    process.env.DB_HOST+":"+
    process.env.DB_PORT+"/"+
    process.env.DB_NAME, 
  {
    authSource: "admin",
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(function() {
  console.log("MongoDB conectado")
}).catch(function(erro) {
  console.log("Houve um erro ao se conectar ao mongoDB: "+erro)
});


/** Rotas */
app.get('/', (requisicao, resposta) => {

  Postagem.find().populate("categoria").lean().sort({data: "DESC"}).then((postagens) => {
    resposta.render("index", {postagens:postagens})
  }).catch((erro) => {
    requisicao.flash("mensagemErro", "Houve um erro interno")
    resposta.redirect("/404")
  })
  
})

app.get('/postagem/:slug', (requisicao, resposta) => {

  Postagem.findOne({slug: requisicao.params.slug}).populate("categoria").lean().then((postagem) => {

    /** Se existe */
    if( postagem ){
      resposta.render("postagem/index", {postagem: postagem})
    }else{
      requisicao.flash("mensagemErro", "Esta postagem não existe.")
    }

  }).catch((erro) => {
    console.log("CATCH: Esta postagem não existe: "+erro)
    resposta.redirect("/")
  })
})

app.get("/404", (requisicao, resposta) => {
  resposta.send("Erro 404!")
})

app.use('/admin', admin)


/** Outros */
const PORT = 3000
app.listen(PORT, () => {
  console.log("Servidor rodando")
})