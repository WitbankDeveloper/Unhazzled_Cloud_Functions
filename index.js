// Functions exports
const functions = require("firebase-functions");

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

exports.csvLink = functions.https.onRequest(async (request, response) => {
  const idref = request.query.idref;
  console.log(idref);
  // create a document Reference to the masterClaims
  const masterClaimsDocRef = db.doc("MasterClaim/" + idref);
  // const masterClaimsDocRef = db.collection("MasterClaim/" + idref)

  const cityRef = db.collection("Receipt");
  const getDoc = await cityRef.where("ReferenceTrip", "==", masterClaimsDocRef).get();
  if (getDoc.empty) {
    console.log("No matching documents.");
    response.send("No matching documents.");
    response.status(40).send({"Error": "No document detected"});
  }
  let csv = "Reciept ID,Receipt Image,Used for,Date,Amount\n";
  let string;
  let total = 0;
  getDoc.forEach(async (recItem) => {
    const reciept = recItem.data();
    // Start csv
    string = reciept.documentIDFF.replace(/,/g, ";") + "," +
      reciept.ImagePath.replace(/,/g, ";") + "," +
      reciept.Category.replace(/,/g, ";") + "," +
      reciept.CreatedDate + "," +
      reciept.TotalAmount + "\n";
    console.log(string);
    csv = csv + string;
    if (reciept.TotalAmount) {
      total = total + reciept.TotalAmount
    }
  });
  csv = csv + "," + "," + "," + "TOTAL:," + total + "\n";
  response.setHeader(
      "Content-disposition",
      "attachment; filename=Unhazzled_sheet.csv",
  );
  response.set("Content-Type", "text/csv");
  response.status(200).send(csv);
});