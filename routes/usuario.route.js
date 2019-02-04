var express = require('express');
var bcrypt = require('bcryptjs');
var usuarios = express();
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');
var Seed = require('../config/config').SEED;

var usuarioAuthenticate = require('../middlewares/verificatoken');
/*Obtener usuarios*/
usuarios.get('/', (req, res, next) => {
    var desde = 0;
    if (!isNaN(req.query.desde)) {
        desde = Number(req.query.desde);
    } else {
        desde = Number(0);
    }
    Usuario.find({}, 'nombre email img role google face').skip(desde).limit(2).exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }
        Usuario.count({}, (error, conteo) => {
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });

        });

    });

});
/* Agregar usuario*/
usuarios.post('/', /*usuarioAuthenticate.verificaatoken,*/ (req, res, next) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });

});
/* Actualizar usuario*/
usuarios.put('/:id', usuarioAuthenticate.verificaatoken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id:' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });


    });
});
/*Eliminar un usuario por el id*/
usuarios.delete('/:id', usuarioAuthenticate.verificaatoken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrarr usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = usuarios;