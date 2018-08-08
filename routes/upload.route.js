var express = require('express');
var upload = express();
var fileUpload = require('express-fileupload');
// default options
upload.use(fileUpload());
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hopsital = require('../models/hospital');
var fs = require('fs');
upload.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    // tipos de colleccion
    var tipos_validos = ['hospitales', 'medicos', 'usuarios'];
    if (tipos_validos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no valida',
            error: { message: 'debe seleccionar una tipo  ' + tipos_validos.join(', ') }
        });
    }
    if (!req.files) {
        return res.status(500).json({
            ok: false,
            mensaje: 'No hay archivos',
            error: { message: 'debe seleccionar una imagen' }
        });
    }
    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension_archivo = nombreCortado[nombreCortado.length - 1];
    var extensionesvalidas = ['png', 'jpeg', 'jpg', 'gif'];

    if (extensionesvalidas.indexOf(extension_archivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: { message: 'debe seleccionar una imagen con la extension ' + extensionesvalidas.join(', ') }
        });
    }
    var nombre_archivo = `${ id }-${ new Date().getMilliseconds() }.${extension_archivo}`;
    var path = `./uploads/${tipo}/${nombre_archivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }
        subirportipo(tipo, id, nombre_archivo, res);

        /*  return res.status(200).json({
             ok: true,
             mensaje: 'arvhivo movido'
         }); */

    });
})

function subirportipo(tipo, id, nombre_archivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe usuario',
                    error: { message: "usuario no existe" },
                    err: err
                });
            }


            var pathviejo = './uploads/usuarios/' + usuario.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathviejo)) {
                fs.unlink(pathviejo);
            }
            usuario.img = nombre_archivo;

            usuario.save((err, usuarioactualizado) => {
                usuarioactualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de usuario actualizada',
                    usuario: usuarioactualizado
                });

            });

        })
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe medico',
                    error: { message: "medico no existe" },
                    err: err
                });
            }

            var pathviejo = './uploads/medicos/' + medico.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathviejo)) {
                fs.unlink(pathviejo);
            }
            medico.img = nombre_archivo;
            medico.save((err, medicoactualizado) => {
                medicoactualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de medico actualizada',
                    medico: medicoactualizado
                });

            });

        })

    }
    if (tipo === 'hospitales') {
        Hopsital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe hospital',
                    error: { message: "hospital no existe" },
                    err: err
                });
            }

            var pathviejo = './uploads/hospitales/' + hospital.img;
            // si existe elimina la imagen anterior
            if (fs.existsSync(pathviejo)) {
                fs.unlink(pathviejo);
            }
            hospital.img = nombre_archivo;
            hospital.save((err, hospitalactualizado) => {
                hospitalactualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'imagen de Hospital actualizada',
                    hospital: hospitalactualizado
                });

            });

        })
    }

}
module.exports = upload;