var express = require('express');
var bcrypt = require('bcryptjs');
var hospital = express();
var Hospitalmodel = require('../models/hospital');
var jwt = require('jsonwebtoken');
var Seed = require('../config/config').SEED;

var hospitalAuthenticate = require('../middlewares/verificatoken');

hospital.get('/', (req, res, next) => {
    var desde = 0;
    if (!isNaN(req.query.desde)) {
        desde = Number(req.query.desde);
    } else {
        desde = Number(0);
    }
    Hospitalmodel.find({}, 'nombre img usuario').populate('usuario', 'nombre email').skip(desde).limit(5).exec((err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errors: err
            });
        }
        Hospitalmodel.count({}, (error, conteo) => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        });
    });
});

/* Agregar Hospital*/
hospital.post('/', hospitalAuthenticate.verificaatoken, (req, res, next) => {
    var body = req.body;

    var hospital_nuevo = new Hospitalmodel({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital_nuevo.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});
/* Actualizar hospital*/
hospital.put('/:id', hospitalAuthenticate.verificaatoken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospitalmodel.findById(id, (err, hospitalres) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id:' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        hospitalres.nombre = body.nombre;
        hospitalres.usuario = req.usuario._id;

        hospitalres.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });


    });
});
/*Eliminar un hospital por el id*/
hospital.delete('/:id', hospitalAuthenticate.verificaatoken, (req, res) => {
    var id = req.params.id;
    Hospitalmodel.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});
module.exports = hospital;