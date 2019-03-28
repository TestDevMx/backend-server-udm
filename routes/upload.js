var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var app = express();

// * Default option (middleware)
app.use(fileupload());

// * Modelos

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');



app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // * Tipos de colleciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: `Los tipos validas son: ${tiposValidos.join(', ')} ` }
        });
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }


    // * Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // * extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: `Las extensiones validas son: ${extensionesValidas.join(', ')} ` }
        });
    }

    // * Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // * Mover el archivo a un pat temporal
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);


    });



});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    var pathViejo = `./uploads/${tipo}/`;

    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                if (!usuario){
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario no existe'}
                    });
                }

                pathViejo += usuario.img;
                // ! Si existe elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) throw err;
                    });
                    // fs.unlinkSync(pathViejo);
                }
                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = '=)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (!medico){
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'medico no existe',
                        errors: { message: 'medico no existe'}
                    });
                }

                pathViejo += medico.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, err => {
                        if (err) throw err;
                    });
                }

                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });
            break;
        case 'hospitales':
            Hospital.findById( id, (err, hospital) =>{

                if (!hospital){
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'hospital no existe',
                        errors: { message: 'hospital no existe'}
                    });
                }

                pathViejo += hospital.img;

                if ( fs.existsSync(pathViejo) ){
                    fs.unlink( pathViejo, err => {
                        if (err) throw err;
                    });
                }

                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) =>{

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });

                });

            });
            break;
        default:
            break;
    }



}

module.exports = app;