//Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializacion
var app = express();
//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) throw err;
    console.log("Base de datos online");
});
//escuchar peticiones
app.listen(3000, () => {
    console.log("Express server puerto 3000 online");
});