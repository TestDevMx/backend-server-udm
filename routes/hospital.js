var express = require('express');
var mdAutentication = require('../middlewares/autenticacion');

var app = express();

/**
 * Importar model
 */
var Hospital = require('../models/hospital');


/**
 * Obtener hospitales
 */
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({} /*, 'nombre img usuario' */)
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
         
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensjae: 'Error al cargar hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });

            });

        });

});


/**
 * Crear un nuevo hospital
 */
app.post('/', mdAutentication.verificaToken, ( req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save(( err, hospitalGuardado) => {

        if ( err ){
            return res.status(400).json({
                ok: false,
                mensjae: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });
});


/**
 * Borrar hospital
 */
 app.delete('/:id', mdAutentication.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove( id, (err, hospitalBorrado) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if ( !hospitalBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id',
                errors: { mensaje: 'No existe hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

 });


 /**
  * Actualiza hospital
  */
app.put('/:id', mdAutentication.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if ( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${id} no existe`,
                errors: { message: 'No existe el hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalActualizado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });


});

// * Export
module.exports = app; 
