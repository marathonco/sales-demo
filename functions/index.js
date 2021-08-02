const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
// console.log(functions);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


exports.userCreate = functions.auth.user().onCreate((user) => {
  return admin
      .firestore()
      .collection("users")
      .doc(user.uid)
      .set(JSON.parse(JSON.stringify(user)));
});

exports.userDelete = functions.firestore
    .document("users/{uid}")
    .onDelete((snapshot, context) => {
      return admin.auth().deleteUser(context.params.uid);
    });
