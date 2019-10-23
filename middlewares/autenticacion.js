
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

/**
 * Verificar token
 */
exports.verificaToken = ( req, res, next ) => {

    var token = req.query.token;
    
    jwt.verify( token, SEED, ( err, decode ) => {
    

        if ( err ){
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
    
        req.usuario = decode.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decode
        // });
    
    });
};


/**
 * Verificar admin
 */
exports.verificaADMIN_ROLE = ( req, res, next ) => {
    var usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
        return;
    }else{
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador',
            errors: {mensaje: 'No es administrador, no puede hacer eso'}
        });
    }
};

/**
 * Verificar admin o mismo usuario
 */
exports.verificaADMIN_o_MismoUsuario = ( req, res, next ) => {
    var usuario = req.usuario;
    var id = req.params.id;

    if(usuario.role === 'ADMIN_ROLE' || usuario._id === id ){
        next();
        return;
    }else{
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No es administrador ni es el mismo usuario',
            errors: {mensaje: 'No es administrador, no puede hacer eso'}
        });
    }
};
