const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const { error, count } = require('console')
const { randomStr } = require('./randomIdStrGenerator')
require('dotenv').config()

/* BANCO */

const gap = parseInt(process.env.GAP)
let idTrx = parseInt(process.env.ID_TRX);

const app = express()
const port = parseInt(process.env.PORT) || 5888

// create application/json parser
var jsonParser = bodyParser.json()

var countTrx = 0; 

var createNewTrx = () => {
    let response = {
    "debito": {
      "id": idTrx,
      "idCredito": null,
      "idTrx": randomStr(parseInt(process.env.RANDOM_STR_LENGTH) || 12),
      "cbu": "",
      "moneda": "",
      "importe": null,
      "cvu": ""
    },
    "estado": {
      "codigo": "00",
      "descripcion": "",
      "errorCoelsa": ""
    }
  }

  idTrx += gap
  return response;
}

// var createNewTrxError = () => {
//     let response = {
//     "debito": {
//       "id": idTrx,
//       "idCredito": null,
//       "idTrx": randomStr(parseInt(process.env.RANDOM_STR_ERROR_LENGTH) || 10),
//       "cbu": "",
//       "moneda": "",
//       "importe": null,
//       "cvu": ""
//     },
//     "estado": {
//       "codigo": "99",
//       "descripcion": "Prueba de error local simulando banco.",
//       "errorCoelsa": "Prueba de error local simulando banco."
//     }
//   }

//   idTrx += gap
//   return response;
// }

var createNewTrxError = () => {
    let response = {
    "debito": null,
    "estado": {
      "codigo": "99",
      "descripcion": "Prueba de error local simulando banco.",
      "errorCoelsa": "Prueba de error local simulando banco."
    }
  }

  return response;
}

app.get('/health', (req, res) => {
  res.status(200).send('healthy')
})

app.post('banco/Transferencia', jsonParser ,(req, res) => {
  console.log("banco/Transferencia")
  console.log(req.body);
  res.status(parseInt(process.env.STATUS_BANCO_TRANSFERENCIA) || 200).json(createNewTrx())
})

app.post('banco/token', jsonParser ,(req, res) => {
  console.log("banco/token", ` [${new Date().toLocaleString('es-AR')}]`)
  console.log(req.body);

  let response = {
    "Access_Token": randomStr(20),
    "Refresh_Token": randomStr(10),
    "Scope": "your_scope_here",
    "Token_Type": "your_token_type_here",
    "Bearer": "your_bearer_here",
    "Expires_In": 3600 //1h
  }
  let status = parseInt(process.env.STATUS_BANCO_TOKEN) || 200
  res.status(status).json(response)
  console.log("STATUS: ", status)
  console.log("RESPONSE:\n", response, "\n")
})

app.post('banco/Transferencia/MovimientoFondos', jsonParser ,(req, res) => {
  console.log("banco/Transferencia/MovimientoFondos")
  console.log(req.body);
  
  let response = {
    "idBancoCredito": idTrx++,
    "idBancoDebito": idTrx++
  }
  
  res.status(parseInt(process.env.STATUS_BANCO_MOVIMIENTO_FONDOS) || 200).json(response)
})

app.post('banco/TransferenciaInterna', jsonParser ,(req, res) => {
  console.log("banco/TransferenciaInterna")
  console.log(req.body);

  idTrx += gap
  let response = {
    "idBancoCredito": idTrx++,
    "idBancoDebito": idTrx++
  }
  res.status(parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_INTERNA) || 200).json(response)
})

app.post('banco/TransferenciaCoinag', jsonParser ,(req, res) => {
  countTrx++;
  
  console.log("banco/TransferenciaCoinag", ` [${new Date().toLocaleString('es-AR')}]`)
  console.log("REQUEST:\n", req.body);
  console.log("AUTHORIZATION:\n", req.headers.authorization);

  let status = parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_COINAG) || 200

  let isError = process.env.IS_ERROR === 'true';
  const response = isError ? createNewTrxError() : createNewTrx();

  res.status(status).json(response)
  
  console.log("STATUS: ", status)
  console.log("RESPONSE:\n", response, "\n")
})

/* INTEGRADOR */

app.post('integrador/Transacciones', jsonParser ,(req, res) => {
  console.log("/Transacciones")
  console.log(req.body);

  res.status(parseInt(process.env.STATUS_INTEGRADOR_TRANSACCIONES) || 200).send()

})

let countNovedad = 0;
app.post('integrador/Cuentas/NovedadCVU', jsonParser ,(req, res) => {
  console.log(`Llamado Nº${++countNovedad} al endpoint 'integrador/Cuentas/NovedadCVU' de la entidad`)
  console.log(req.body);

  res.status(parseInt(process.env.STATUS_INTEGRADOR_NOVEDAD_CVU) || 200).send()

})


app.get('integrador/Saldo/:cuit/:nroCuentaEnEntidad', jsonParser ,(req, res) => {
  console.log(`Llamado Nº${++countNovedad} al endpoint 'integrador/Saldo/${req.params.cuit}/${req.params.nroCuentaEnEntidad}' de la entidad`)

  let response = {"fechaSaldo":"2024-11-25T03:00:00Z","importe":18564.2700,"idMoneda":1}
  res.status(parseInt(process.env.STATUS_INTEGRADOR_SALDO) || 200).send(response)

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
