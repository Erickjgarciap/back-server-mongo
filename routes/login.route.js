var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var login = express();
var Usuario = require('../models/usuario');
var Seed = require('../config/config').SEED;

// google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        google: true,
        email: payload.email,
        img: payload.picture
    }
}
/* Autenticacion normal con la base de datos */
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
    /* Autenticacion con token de Google*/
login.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token).catch(e => {
        res.status(403).json({
            ok: false,
            mensaje: "Token no valido"
        });
    })
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar  usuarios',
                errors: err
            });
        }
        if (usuarioDb) {
            if (usuarioDb.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                    errors: err
                });
            } else {
                var token = jwt.sign({ usuario: usuarioDb }, Seed, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDb,
                    id: usuarioDb.id,
                    token: token
                });
            }

        } else { // usuario no existe hay que crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error, no se grabo el usuario',
                        errors: err
                    });
                }
                var token = jwt.sign({ usuario: usuarioDB }, Seed, { expiresIn: 14400 });
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB.id,
                    token: token
                });

            })

        }
    });

    /*   res.status(200).json({
          ok: true,
          mensaje: "algo ",
          googleUser: googleUser
      }); */

})
module.exports = login;