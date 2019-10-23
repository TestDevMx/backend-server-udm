var express = require('express');
var mdAutentication = require('../middlewares/autenticacion');
var app = express();

/**
 * Importar el modelo
 */
 var Medico = require('../models/medico');


 /**
  * Obtener medicos
  */
app.get('/', (req, res, next) =>{

    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensjae: 'Error al cargar medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });

            });
        });

});



/**
 * Obtener médico
 */

 app.get('/:id', (req, res)=>{

    var id = req.params.id;

    Medico.findById(id)
          .populate('usuario', 'nombre email img')
          .populate('hospital')
          .exec((err, medico) =>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }
    
            if ( !medico ){
                return res.status(400).json({
                    ok: false,
                    mensaje: `El medico con el id: ${id} no existe`,
                    errors: { message: 'No existe el medico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico
            });


          });


 });

/**
 * Crear un nuevo medico
 */
app.post('/', mdAutentication.verificaToken, ( req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save(( err, medicoGuardado) => {

        if ( err ){
            return res.status(400).json({
                ok: false,
                mensjae: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });
});


/**
 * Borrar medico
 */
app.delete('/:id', mdAutentication.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Medico.findByIdAndRemove( id, (err, medicoBorrado) => {

        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }

        if ( !medicoBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: { mensaje: 'No existe medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

 });


 /**
  * Actualiza medico
  */
app.put('/:id', mdAutentication.verificaToken, (req, res, next) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) =>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if ( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id: ${id} no existe`,
                errors: { message: 'No existe el medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoActualizado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });


});



module.exports = app;

