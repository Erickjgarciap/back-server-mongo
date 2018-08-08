var express = require('express');
var bcrypt = require('bcryptjs');
var medico = express();
var Medicomodel = require('../models/medico');
var jwt = require('jsonwebtoken');
var Seed = require('../config/config').SEED;
var medicoAuthenticate = require('../middlewares/verificatoken');


/*get medicos */
medico.get('/', (req, res, next) => {
    var desde = 0;
    if (!isNaN(req.query.desde)) {
        desde = Number(req.query.desde);
    } else {
        desde = Number(0);
    }
    Medicomodel.find({}, 'nombre usuario hospital')
        .populate('usuario', 'nombre email').populate('hospital').skip(desde).limit(5).exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medicomodel.count({}, (error, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicoss: medicos,
                    total: conteo
                });
            })
        });
});


/* Medicos post*/

medico.post('/', medicoAuthenticate.verificaatoken, (req, res, next) => {
    var body = req.body;

    var medico_nuevo = new Medicomodel({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico_nuevo.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});
/** actualiza medico */
medico.put('/:id', medicoAuthenticate.verificaatoken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medicomodel.findById(id, (err, medicores) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medicores) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id:' + id + 'no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        medicores.nombre = body.nombre;
        //hospitalres.usuario = req.usuario._id;
        medicores.hospital = body.hospital;

        medicores.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });


    });
});
/*Eliminar un medico por el id*/
medico.delete('/:id', medicoAuthenticate.verificaatoken, (req, res) => {
    var id = req.params.id;
    Medicomodel.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});

module.exports = medico;