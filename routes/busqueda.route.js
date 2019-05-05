var express = require('express');
var busqueda = express();
var Hospitalmodel = require('../models/hospital');
var Medicomodel = require('../models/medico');
var UsuarioModel = require('../models/usuario');

busqueda.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    /*Ejecuta las promesas de un arreglo de promesas */
    Promise.all([buscarHospital(busqueda, regex), buscarMedicos(busqueda, regex),
            buscarUsuario(busqueda, regex)
        ])
        .then(arr_response => {
            res.status(200).json({
                ok: true,
                hospitales: arr_response[0],
                medicos: arr_response[1],
                usuario: arr_response[2]
            });
        })
});

busqueda.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuario(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospital(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: "los tipos de busqueda solo son Usuario,medicos,hospitales",
                error: { message: "tabla o tipo no valido" }
            });

    }
    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            mensaje: "estos son los datos",
            [tabla]: data
        });


    });

});

function buscarHospital(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospitalmodel.find({ nombre: regex }, (err, data) => {
            if (err) {
                reject("error al cargar hospitales", err);
            } else {
                resolve(data);
            }
        });


    })
};

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medicomodel.find({ nombre: regex }, (err, data) => {
            if (err) {
                reject("error al cargar medicos", err);
            } else {
                resolve(data);
            }
        });
    })
};

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        UsuarioModel.find({}, 'nombre email role google face img').or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, data) => {
                if (err) {
                    reject("error al cargar usuarios", err);
                } else {
                    resolve(data);
                }
            });
    })
};

module.exports = busqueda;