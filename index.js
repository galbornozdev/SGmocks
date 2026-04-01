const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const { error, count } = require('console')
const { randomStr } = require('./randomIdStrGenerator')
require('dotenv').config()

/* CONFIG */

let config = {
  gap: parseInt(process.env.GAP) || 1,
  idTrx: parseInt(process.env.ID_TRX) || 999999,
  isError: process.env.IS_ERROR === 'true',
  randomStrLength: parseInt(process.env.RANDOM_STR_LENGTH) || 12,
  randomStrErrorLength: parseInt(process.env.RANDOM_STR_ERROR_LENGTH) || 10,
  statusCodes: {
    bancoTransferencia: parseInt(process.env.STATUS_BANCO_TRANSFERENCIA) || 200,
    bancoToken: parseInt(process.env.STATUS_BANCO_TOKEN) || 200,
    bancoMovimientoFondos: parseInt(process.env.STATUS_BANCO_MOVIMIENTO_FONDOS) || 200,
    bancoTransferenciaInterna: parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_INTERNA) || 200,
    bancoTransferenciaCoinag: parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_COINAG) || 200,
    integradorTransacciones: parseInt(process.env.STATUS_INTEGRADOR_TRANSACCIONES) || 200,
    integradorNovedadCVU: parseInt(process.env.STATUS_INTEGRADOR_NOVEDAD_CVU) || 200,
    integradorSaldo: parseInt(process.env.STATUS_INTEGRADOR_SALDO) || 200
  }
}

/* BANCO */

const app = express()
const port = parseInt(process.env.PORT) || 5888

// create application/json parser
var jsonParser = bodyParser.json()

var countTrx = 0; 

var createNewTrx = () => {
    let response = {
    "debito": {
      "id": config.idTrx,
      "idCredito": null,
      "idTrx": randomStr(config.randomStrLength),
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

  config.idTrx += config.gap
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

app.post('/banco/Transferencia', jsonParser ,(req, res) => {
  console.log("banco/Transferencia")
  console.log(req.body);
  res.status(config.statusCodes.bancoTransferencia).json(createNewTrx())
})

app.post('/banco/token', jsonParser ,(req, res) => {
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
  let status = config.statusCodes.bancoToken
  res.status(status).json(response)
  console.log("STATUS: ", status)
  console.log("RESPONSE:\n", response, "\n")
})

app.post('/banco/Transferencia/MovimientoFondos', jsonParser ,(req, res) => {
  console.log("banco/Transferencia/MovimientoFondos")
  console.log(req.body);
  
  let response = {
    "idBancoCredito": config.idTrx++,
    "idBancoDebito": config.idTrx++
  }
  
  res.status(config.statusCodes.bancoMovimientoFondos).json(response)
})

app.post('/banco/TransferenciaInterna', jsonParser ,(req, res) => {
  console.log("banco/TransferenciaInterna")
  console.log(req.body);

  config.idTrx += config.gap
  let response = {
    "idBancoCredito": config.idTrx++,
    "idBancoDebito": config.idTrx++
  }
  res.status(config.statusCodes.bancoTransferenciaInterna).json(response)
})

app.post('/banco/TransferenciaCoinag', jsonParser ,(req, res) => {
  countTrx++;
  
  console.log("banco/TransferenciaCoinag", ` [${new Date().toLocaleString('es-AR')}]`)
  console.log("REQUEST:\n", req.body);
  console.log("AUTHORIZATION:\n", req.headers.authorization);

  let status = config.statusCodes.bancoTransferenciaCoinag

  let isError = config.isError;
  const response = isError ? createNewTrxError() : createNewTrx();

  res.status(status).json(response)
  
  console.log("STATUS: ", status)
  console.log("RESPONSE:\n", response, "\n")
})

/* INTEGRADOR */

app.post('/integrador/Transacciones', jsonParser ,(req, res) => {
  console.log("/Transacciones")
  console.log(req.body);

  res.status(config.statusCodes.integradorTransacciones).send()

})

let countNovedad = 0;
app.post('/integrador/Cuentas/NovedadCVU', jsonParser ,(req, res) => {
  console.log(`Llamado Nº${++countNovedad} al endpoint 'integrador/Cuentas/NovedadCVU' de la entidad`)
  console.log(req.body);

  res.status(config.statusCodes.integradorNovedadCVU).send()

})


app.get('/integrador/Saldo/:cuit/:nroCuentaEnEntidad', jsonParser ,(req, res) => {
  console.log(`Llamado Nº${++countNovedad} al endpoint 'integrador/Saldo/${req.params.cuit}/${req.params.nroCuentaEnEntidad}' de la entidad`)

  let response = {"fechaSaldo":"2024-11-25T03:00:00Z","importe":18564.2700,"idMoneda":1}
  res.status(config.statusCodes.integradorSaldo).send(response)

})

/* ADMIN */

app.post('/admin/config', jsonParser, (req, res) => {
  console.log("admin/config")
  console.log(req.body);

  const updates = req.body;

  if (updates.GAP !== undefined) {
    config.gap = parseInt(updates.GAP);
    process.env.GAP = updates.GAP.toString();
  }
  if (updates.ID_TRX !== undefined) {
    config.idTrx = parseInt(updates.ID_TRX);
    process.env.ID_TRX = updates.ID_TRX.toString();
  }
  if (updates.IS_ERROR !== undefined) {
    config.isError = updates.IS_ERROR === true || updates.IS_ERROR === 'true';
    process.env.IS_ERROR = config.isError.toString();
  }
  if (updates.RANDOM_STR_LENGTH !== undefined) {
    config.randomStrLength = parseInt(updates.RANDOM_STR_LENGTH);
    process.env.RANDOM_STR_LENGTH = updates.RANDOM_STR_LENGTH.toString();
  }
  if (updates.RANDOM_STR_ERROR_LENGTH !== undefined) {
    config.randomStrErrorLength = parseInt(updates.RANDOM_STR_ERROR_LENGTH);
    process.env.RANDOM_STR_ERROR_LENGTH = updates.RANDOM_STR_ERROR_LENGTH.toString();
  }

  // Status codes
  if (updates.STATUS_BANCO_TRANSFERENCIA !== undefined) {
    config.statusCodes.bancoTransferencia = parseInt(updates.STATUS_BANCO_TRANSFERENCIA);
    process.env.STATUS_BANCO_TRANSFERENCIA = updates.STATUS_BANCO_TRANSFERENCIA.toString();
  }
  if (updates.STATUS_BANCO_TOKEN !== undefined) {
    config.statusCodes.bancoToken = parseInt(updates.STATUS_BANCO_TOKEN);
    process.env.STATUS_BANCO_TOKEN = updates.STATUS_BANCO_TOKEN.toString();
  }
  if (updates.STATUS_BANCO_MOVIMIENTO_FONDOS !== undefined) {
    config.statusCodes.bancoMovimientoFondos = parseInt(updates.STATUS_BANCO_MOVIMIENTO_FONDOS);
    process.env.STATUS_BANCO_MOVIMIENTO_FONDOS = updates.STATUS_BANCO_MOVIMIENTO_FONDOS.toString();
  }
  if (updates.STATUS_BANCO_TRANSFERENCIA_INTERNA !== undefined) {
    config.statusCodes.bancoTransferenciaInterna = parseInt(updates.STATUS_BANCO_TRANSFERENCIA_INTERNA);
    process.env.STATUS_BANCO_TRANSFERENCIA_INTERNA = updates.STATUS_BANCO_TRANSFERENCIA_INTERNA.toString();
  }
  if (updates.STATUS_BANCO_TRANSFERENCIA_COINAG !== undefined) {
    config.statusCodes.bancoTransferenciaCoinag = parseInt(updates.STATUS_BANCO_TRANSFERENCIA_COINAG);
    process.env.STATUS_BANCO_TRANSFERENCIA_COINAG = updates.STATUS_BANCO_TRANSFERENCIA_COINAG.toString();
  }
  if (updates.STATUS_INTEGRADOR_TRANSACCIONES !== undefined) {
    config.statusCodes.integradorTransacciones = parseInt(updates.STATUS_INTEGRADOR_TRANSACCIONES);
    process.env.STATUS_INTEGRADOR_TRANSACCIONES = updates.STATUS_INTEGRADOR_TRANSACCIONES.toString();
  }
  if (updates.STATUS_INTEGRADOR_NOVEDAD_CVU !== undefined) {
    config.statusCodes.integradorNovedadCVU = parseInt(updates.STATUS_INTEGRADOR_NOVEDAD_CVU);
    process.env.STATUS_INTEGRADOR_NOVEDAD_CVU = updates.STATUS_INTEGRADOR_NOVEDAD_CVU.toString();
  }
  if (updates.STATUS_INTEGRADOR_SALDO !== undefined) {
    config.statusCodes.integradorSaldo = parseInt(updates.STATUS_INTEGRADOR_SALDO);
    process.env.STATUS_INTEGRADOR_SALDO = updates.STATUS_INTEGRADOR_SALDO.toString();
  }

  res.status(200).json({ message: "Config updated", config });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
