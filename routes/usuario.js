var express = require('express');
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');


/**
 * obtener todos los usuarios
 */
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios, //! se puede evitar usuarios ES6
                        total: conteo
                    });
                    
                });

            });
});







/**
 * Actualizar usuario
 */
app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, ( err, usuario ) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if ( !usuario ){
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id: ${id} no existe`,
                errors: { message: 'No existe el usuario con ese ID' }
            });
        }
        
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( err, usuarioGuardado ) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });


    });



});


/**
 * Crear un nuevo usuario
 */
app.post('/', mdAutenticacion.verificaToken, ( req, res, next ) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password , 10 ),
        img: body.img,
        role: body.role

    });

    usuario.save( ( err, usuarioGuardado ) => {

        if ( err ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});


/**
 * Eliminar usuario
 */
 app.delete('/:id', mdAutenticacion.verificaToken, ( req, res, next ) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove( id, ( err, usuarioBorrado ) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if ( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id',
                errors: { mensaje: 'No existe usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

 });


module.exports = app;