const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.checkerFunction = functions.https.onCall( async (data, context) => {
  const allItemData = await db.collection("Imgs").doc(data.img).get();
  const itemData = allItemData.data().things
      .find((thing) => thing.name === data.thing);
  functions.logger.log(allItemData.data());
  functions.logger.log(data);
  if (itemData.coords.x1 < data.x &&
      itemData.coords.y1 < data.y &&
      itemData.coords.x2 > data.x &&
      itemData.coords.y2 > data.y) {
    return {found: true};
  } else {
    return {found: false};
  }
});
