var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

//! google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');


/**
 * Renovar token
 */
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res, next) =>{

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14000 });

    return res.status(200).json({
        ok:true,
        usuario: req.usuario,
        token
    });

});



/**
 * Autenticación google
 */

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload.sub;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async (req, res, next) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido',
                error: e
            });

        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }


        if (usuarioDB) {

            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar autenticación normal',
                    errors: err
                });
            } else {

                usuarioDB.password = ':)';

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14000 });


                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                    menu:obtenerMenu(usuarioDB.role)
                });
            }

        } else {
            //El usuario no existe... se creara
            var usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                google: true,
                password: ':)',

            });

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14000 });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id,
                    menu:obtenerMenu(usuarioDB.role)
                });

            });
        }



    });


});



/**
 * Autenticacion normal
 */
app.post('/', (req, res, next) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //! Crear tocken!!!
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14000 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token,
            id: usuarioDB._id,
            menu:obtenerMenu(usuarioDB.role)
        });


    });

});



function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard' },
            { titulo: 'ProgressBar', url: '/progress' },
            { titulo: 'Gráficas', url: '/graficas1' },
            { titulo: 'Promesas', url: '/promesas' },
            { titulo: 'RxJs', url: '/rxjs' }
          ]
        },
        {
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-lock-open',
          submenu:[
            // {titulo:'Usuarios', url: '/usuarios'},
            {titulo:'Hospitales', url: '/hospitales'},
            {titulo:'Medicos', url: '/medicos'},
          ]
        }
      ];



      if(ROLE === 'ADMIN_ROLE'){
          menu[1].submenu.unshift({titulo:'Usuarios', url: '/usuarios'});
      }

      return menu;

}
module.exports = app;

