var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) =>{
    
    var tipo = req.params.tipo;
    var img = req.params.img;

    // * Tipos de colleciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: `Los tipos validas son: ${tiposValidos.join(', ')} ` }
        });
    }


    var pathImagen = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );

    if (fs.existsSync( pathImagen )){
        res.sendFile( pathImagen );
    }else{
        var pathNoImagen = path.resolve( __dirname, `../assets/no-img.jpg` );
        res.sendFile( pathNoImagen );
    }
    
    

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Tipo de coleccion no valida',
    //     errors: { message: `Los tipos validas son: ${tiposValidos.join(', ')} ` }
    // });


});

module.exports = app;