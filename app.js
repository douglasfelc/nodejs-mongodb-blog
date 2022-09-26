/** Importando módulos */
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const passport = require('passport')
require("./config/auth")(passport)

const session = require("express-session")
const flash = require("connect-flash")

const admin = require("./routes/admin")
const usuario = require("./routes/usuario")

require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")

/** Instanciar o express */
const app = express()


/** Configurações */
//Sessão(1º)
app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: true,
    saveUninitialized: true
  })
)

//Passport(2º)
app.use(passport.initialize())
app.use(passport.session())

//Flash(3º)
app.use(flash())

//Middleware
app.use((req, res, next) => {
  /** Variáveis globais */
  res.locals.mensagemSucesso = req.flash("mensagemSucesso")
  res.locals.mensagemErro = req.flash("mensagemErro")+req.flash("error")

  /** req.user: criado pelo passport com os dados do usuário logado
      Se tiver usuário na sessão */
  if( req.user ){
    /** Armazena os dados em JSON em uma variável global */
    res.locals.usuarioLogado = req.user.toJSON()
  }else{
    res.locals.usuarioLogado = null
  }

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
app.get('/', (req, res) => {

  Postagem.find().populate("categoria").lean().sort({inclusao: "DESC"}).then((postagens) => {
    res.render("index", {postagens:postagens})
  }).catch((erro) => {
    req.flash("mensagemErro", "Houve um erro interno")
    res.redirect("/404")
  })
  
})

app.get('/postagem/:slug', (req, res) => {

  Postagem.findOne({slug: req.params.slug}).populate("categoria").lean().then((postagem) => {

    /** Se existe */
    if( postagem ){
      res.render("postagem/index", {postagem: postagem})
    }else{
      req.flash("mensagemErro", "Esta postagem não existe.")
    }

  }).catch((erro) => {
    console.log("CATCH: Esta postagem não existe: "+erro)
    res.redirect("/")
  })
})

app.get('/categorias', (req, res) => {

  Categoria.find().lean().sort({nome:'asc'}).then((categorias) => {
    res.render("categorias/index", {categorias: categorias})
  }).catch((erro) => {
    req.flash("mensagemErro", "Houve um erro ao listar as categorias, tente novamente mais tarde.")
    console.log("Erro ao listar as categorias "+erro)
    res.redirect("/")
  })
  
})

app.get('/categoria/:slug', (req, res) => {

  Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {

    /** Se existe */
    if( categoria ){
      Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
        res.render("categorias/postagens", {postagens:postagens, categoria: categoria})
      }).catch((erro) => {
        req.flash("mensagemErro", "Houve um erro ao listar as postagens!")
        res.redirect("/")
      })

    }else{
      req.flash("mensagemErro", "Esta categoria não existe.")
      res.redirect("/")
    }

  }).catch((erro) => {
    console.log("CATCH: Esta categoria não existe: "+erro)
    req.flash("mensagemErro", "Esta categoria não existe.")
    res.redirect("/")
  })
})

app.get("/404", (req, res) => {
  res.send("Erro 404!")
})

app.use('/admin', admin)
app.use('/usuario', usuario)



app.listen(process.env.SERVER_PORT, () => {
  console.log("Servidor rodando")
})