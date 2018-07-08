//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


//Inicializacion
var app = express();

/*Body parser*/
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//importar rutas
var approute = require('./routes/app');
var usuario = require('./routes/usuario.route');
var login = require('./routes/login.route');

//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) throw err;
    console.log("Base de datos online");
});

//Rutas
app.use('/', approute);
app.use('/usuarios', usuario);
app.use('/login', login);

//escuchar peticiones
app.listen(3000, () => {
    console.log("Express server puerto 3000 online");
});