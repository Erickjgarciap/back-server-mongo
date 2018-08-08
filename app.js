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
var hospital = require('./routes/hospital.route');
var medico = require('./routes/medico.route');
var busqueda = require('./routes/busqueda.route');
var upload = require('./routes/upload.route');
var imagenes = require('./routes/imagenes');

//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitaldb', (err, res) => {
    if (err) throw err;
    console.log("Base de datos online");
});

//Rutas
app.use('/', approute);
app.use('/usuarios', usuario);
app.use('/login', login);
app.use('/hospital', hospital);
app.use('/medico', medico);
app.use('/busqueda', busqueda);
app.use('/upload', upload);
app.use('/img', imagenes);
//escuchar peticiones
app.listen(3000, () => {
    console.log("Express server puerto 3000 online");
});