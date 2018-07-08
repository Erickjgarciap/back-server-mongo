var jwt = require('jsonwebtoken');
var Seed = require('../config/config').SEED;

exports.verificaatoken = function(req, res, next) {

    var token = req.query.token;
    jwt.verify(token, Seed, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token no valido',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });

};