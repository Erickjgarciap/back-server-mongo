var express = require('express');
var app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'peticion de prueba oki doki'
    });
});

module.exports = app;