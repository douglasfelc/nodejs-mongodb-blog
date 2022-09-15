/** Importando módulos */
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const admin = require("./routes/admin")

const session = require("express-session")
const flash = require("connect-flash")


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

app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}) );
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
  resposta.send("Página principal")
})

app.use('/admin', admin)


/** Outros */
const PORT = 3000
app.listen(PORT, () => {
  console.log("Servidor rodando")
})