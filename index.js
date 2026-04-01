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
  transferenciaCoinagIsError: process.env.TRANSFERENCIA_COINAG_IS_ERROR === 'true',
  randomStrLength: parseInt(process.env.RANDOM_STR_LENGTH) || 12,
  randomStrErrorLength: parseInt(process.env.RANDOM_STR_ERROR_LENGTH) || 10,
  statusCodes: {
    bancoTransferencia: parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_STATUS_CODE) || 200,
    bancoToken: parseInt(process.env.STATUS_BANCO_TOKEN_STATUS_CODE) || 200,
    bancoMovimientoFondos: parseInt(process.env.STATUS_BANCO_MOVIMIENTO_FONDOS_STATUS_CODE) || 200,
    bancoTransferenciaInterna: parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_INTERNA_STATUS_CODE) || 200,
    bancoTransferenciaCoinag: parseInt(process.env.STATUS_BANCO_TRANSFERENCIA_COINAG_STATUS_CODE) || 200,
    bancoConsulta: parseInt(process.env.STATUS_BANCO_CONSULTA_STATUS_CODE) || 200,
    integradorTransacciones: parseInt(process.env.STATUS_INTEGRADOR_TRANSACCIONES_STATUS_CODE) || 200,
    integradorNovedadCVU: parseInt(process.env.STATUS_INTEGRADOR_NOVEDAD_CVU_STATUS_CODE) || 200,
    integradorSaldo: parseInt(process.env.STATUS_INTEGRADOR_SALDO_STATUS_CODE) || 200
  },
  bancoConsultaResponse: process.env.BANCO_CONSULTA_RESPONSE ? JSON.parse(process.env.BANCO_CONSULTA_RESPONSE) : {"cuenta":{"tipoCuenta":"20","idBanco":"431","activa":true,"cbu":"4310001322100000000016","cbuAnterior":null,"alias":null,"aliasAnterior":null,"bloqueado":false,"fechaAlta":"0001-01-01T00:00:00","fechaModificacion":"0001-01-01T00:00:00"},"titulares":[{"tipoPersona":"J","cuit":"30526414086","nombre":"BOLSA DE COMERCIO DE ROSARIO"}]},
  integradorSaldoResponse: process.env.INTEGRADOR_SALDO_RESPONSE ? JSON.parse(process.env.INTEGRADOR_SALDO_RESPONSE) : {"fechaSaldo":"2024-11-25T03:00:00Z","importe":18564.2700,"idMoneda":1}
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

  let isError = config.transferenciaCoinagIsError;
  const response = isError ? createNewTrxError() : createNewTrx();

  res.status(status).json(response)
  
  console.log("STATUS: ", status)
  console.log("RESPONSE:\n", response, "\n")
})

app.get('/banco/Consulta/:cbu', jsonParser ,(req, res) => {
  console.log(`integrador/Saldo/${req.params.cbu}`)
  console.log("REQUEST:\n", req.body);
  console.log("AUTHORIZATION:\n", req.headers.authorization);

  let response = config.bancoConsultaResponse
  res.status(config.statusCodes.bancoConsulta).send(response)

  
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

  let response = config.integradorSaldoResponse
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
  if (updates.TRANSFERENCIA_COINAG_IS_ERROR !== undefined) {
    config.transferenciaCoinagIsError = updates.TRANSFERENCIA_COINAG_IS_ERROR === true || updates.TRANSFERENCIA_COINAG_IS_ERROR === 'true';
    process.env.TRANSFERENCIA_COINAG_IS_ERROR = config.transferenciaCoinagIsError.toString();
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
  if (updates.STATUS_BANCO_TRANSFERENCIA_STATUS_CODE !== undefined) {
    config.statusCodes.bancoTransferencia = parseInt(updates.STATUS_BANCO_TRANSFERENCIA_STATUS_CODE);
    process.env.STATUS_BANCO_TRANSFERENCIA_STATUS_CODE = updates.STATUS_BANCO_TRANSFERENCIA_STATUS_CODE.toString();
  }
  if (updates.STATUS_BANCO_TOKEN_STATUS_CODE !== undefined) {
    config.statusCodes.bancoToken = parseInt(updates.STATUS_BANCO_TOKEN_STATUS_CODE);
    process.env.STATUS_BANCO_TOKEN_STATUS_CODE = updates.STATUS_BANCO_TOKEN_STATUS_CODE.toString();
  }
  if (updates.STATUS_BANCO_MOVIMIENTO_FONDOS_STATUS_CODE !== undefined) {
    config.statusCodes.bancoMovimientoFondos = parseInt(updates.STATUS_BANCO_MOVIMIENTO_FONDOS_STATUS_CODE);
    process.env.STATUS_BANCO_MOVIMIENTO_FONDOS_STATUS_CODE = updates.STATUS_BANCO_MOVIMIENTO_FONDOS_STATUS_CODE.toString();
  }
  if (updates.STATUS_BANCO_TRANSFERENCIA_INTERNA_STATUS_CODE !== undefined) {
    config.statusCodes.bancoTransferenciaInterna = parseInt(updates.STATUS_BANCO_TRANSFERENCIA_INTERNA_STATUS_CODE);
    process.env.STATUS_BANCO_TRANSFERENCIA_INTERNA_STATUS_CODE = updates.STATUS_BANCO_TRANSFERENCIA_INTERNA_STATUS_CODE.toString();
  }
  if (updates.STATUS_BANCO_TRANSFERENCIA_COINAG_STATUS_CODE !== undefined) {
    config.statusCodes.bancoTransferenciaCoinag = parseInt(updates.STATUS_BANCO_TRANSFERENCIA_COINAG_STATUS_CODE);
    process.env.STATUS_BANCO_TRANSFERENCIA_COINAG_STATUS_CODE = updates.STATUS_BANCO_TRANSFERENCIA_COINAG_STATUS_CODE.toString();
  }
  if (updates.STATUS_BANCO_CONSULTA_STATUS_CODE !== undefined) {
    config.statusCodes.bancoConsulta = parseInt(updates.STATUS_BANCO_CONSULTA_STATUS_CODE);
    process.env.STATUS_BANCO_CONSULTA_STATUS_CODE = updates.STATUS_BANCO_CONSULTA_STATUS_CODE.toString();
  }
  if (updates.STATUS_INTEGRADOR_TRANSACCIONES_STATUS_CODE !== undefined) {
    config.statusCodes.integradorTransacciones = parseInt(updates.STATUS_INTEGRADOR_TRANSACCIONES_STATUS_CODE);
    process.env.STATUS_INTEGRADOR_TRANSACCIONES_STATUS_CODE = updates.STATUS_INTEGRADOR_TRANSACCIONES_STATUS_CODE.toString();
  }
  if (updates.STATUS_INTEGRADOR_NOVEDAD_CVU_STATUS_CODE !== undefined) {
    config.statusCodes.integradorNovedadCVU = parseInt(updates.STATUS_INTEGRADOR_NOVEDAD_CVU_STATUS_CODE);
    process.env.STATUS_INTEGRADOR_NOVEDAD_CVU_STATUS_CODE = updates.STATUS_INTEGRADOR_NOVEDAD_CVU_STATUS_CODE.toString();
  }
  if (updates.STATUS_INTEGRADOR_SALDO_STATUS_CODE !== undefined) {
    config.statusCodes.integradorSaldo = parseInt(updates.STATUS_INTEGRADOR_SALDO_STATUS_CODE);
    process.env.STATUS_INTEGRADOR_SALDO_STATUS_CODE = updates.STATUS_INTEGRADOR_SALDO_STATUS_CODE.toString();
  }

  // Response payloads
  if (updates.BANCO_CONSULTA_RESPONSE !== undefined) {
    try {
      if (typeof updates.BANCO_CONSULTA_RESPONSE === 'string') {
        config.bancoConsultaResponse = JSON.parse(updates.BANCO_CONSULTA_RESPONSE);
        process.env.BANCO_CONSULTA_RESPONSE = updates.BANCO_CONSULTA_RESPONSE;
      } else {
        config.bancoConsultaResponse = updates.BANCO_CONSULTA_RESPONSE;
        process.env.BANCO_CONSULTA_RESPONSE = JSON.stringify(updates.BANCO_CONSULTA_RESPONSE);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON in BANCO_CONSULTA_RESPONSE", details: error.message });
      return;
    }
  }
  if (updates.INTEGRADOR_SALDO_RESPONSE !== undefined) {
    try {
      if (typeof updates.INTEGRADOR_SALDO_RESPONSE === 'string') {
        config.integradorSaldoResponse = JSON.parse(updates.INTEGRADOR_SALDO_RESPONSE);
        process.env.INTEGRADOR_SALDO_RESPONSE = updates.INTEGRADOR_SALDO_RESPONSE;
      } else {
        config.integradorSaldoResponse = updates.INTEGRADOR_SALDO_RESPONSE;
        process.env.INTEGRADOR_SALDO_RESPONSE = JSON.stringify(updates.INTEGRADOR_SALDO_RESPONSE);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid JSON in INTEGRADOR_SALDO_RESPONSE", details: error.message });
      return;
    }
  }

  res.status(200).json({ message: "Config updated", config });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
