const express = require("express")
const router = express.Router()


router.get('/', (requisicao, resposta) => {
  resposta.send("Página principal do admin")
})

router.get('/posts', (requisicao, resposta) => {
  resposta.send("Página de posts")
})

router.get('/categorias', (requisicao, resposta) => {
  resposta.send("Página de categorias")
})

module.exports = router