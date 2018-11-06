const functions = require('firebase-functions');
var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var firestore = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.webhookactions = functions.https.onRequest((request, response) => {

    // console.log("Request.body.queryResult.parameters: ", request.body.queryResult.parameters);
    // console.log("Accion", request.body.queryResult.action);

    switch (request.body.queryResult.action) {
        case 'realizarReserva':
            let params = request.body.queryResult.parameters;

            firestore.collection('reservas').add(params)
                .then(() => {
                    response.send({
                        fulfillmentText: `Señor(a) ${params.given_name}, su reserva de habitacion tipo: ${params.tipo_habitacion} queda agendada para 
                        ${params.number} personas, nos contactaremos con usted pronto al correo: ${params.email}.`
                    });
                })
                .catch((e => {
                    console.log("error: ", e);
                    response.send({
                        fulfillmentText: `Algo salio mal al realizar el registro en la base de datos`
                    });
                }))
            break;

        case 'buscarReservas':
            firestore.collection('reservas').get()
                .then((querySnapshot) => {
                    var orders = [];
                    querySnapshot.forEach((doc) => { orders.push(doc.data()) });

                    var speech = `Tienes ${orders.length} reservaciones \n`
                    orders.forEach((eachOrder, index) => {
                        speech += `# ${index + 1}: habitacion ${eachOrder.tipo_habitacion} para ${eachOrder.number} reservada por ${eachOrder.given_name}`
                    })

                    response.send({
                        fulfillmentText: speech
                    })
                })
                .catch((err) => {
                    console.log("Error leyendo documentos", err);
                    response.send({
                        fulfillmentText: "Algo salió mal leyendo la base de datos"
                    })
                })
            break;

        default:
            response.send({
                fulfillmentText: "No se encontró ninguna accion válida"
            })
            break;

    }


});