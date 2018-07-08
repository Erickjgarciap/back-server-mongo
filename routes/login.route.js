var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var login = express();
var Usuario = require('../models/usuario');
var Seed = require('../config/config').SEED;

login.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuariobasededatos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar  usuarios',
                errors: err
            });
        }
        if (!usuariobasededatos) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuariobasededatos.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - password',
                errors: err
            });

        }
        //crear un token
        var token = jwt.sign({ usuario: usuariobasededatos }, Seed, { expiresIn: 14400 });

        usuariobasededatos.password = ':)'
        res.status(200).json({
            ok: true,
            usuario: usuariobasededatos,
            id: usuariobasededatos.id,
            token: token
        });
    });
})

module.exports = login;