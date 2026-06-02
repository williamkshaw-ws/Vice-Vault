const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.firestore().collection("catalog").get().then(s => console.log("Catalog size:", s.size));
