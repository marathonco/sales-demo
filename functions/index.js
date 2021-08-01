const functions = require("firebase-functions");

// console.log(functions);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


exports.accountCreate = functions.auth.user().onCreate(user => {
    console.log(user.data);
    userDoc = {'email' = user.data.email,
               'displayName' = user.data.displayName}
    admin.firestore().collection('users').doc(user.data.uid)
    .set(userDoc).then(writeResult => {
        console.log('User Created result:', writeResult);
        return;
    }).catch(err => {
       console.log(err);
       return;
    });
});
