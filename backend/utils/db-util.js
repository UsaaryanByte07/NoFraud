require("dotenv").config();

// Load .env file from current directory

const user = encodeURIComponent(process.env.DB_USER); //To encode any special chars present in the user which can't be directly passed in to MongoClient.connect
const password = encodeURIComponent(process.env.DB_PASSWORD); //To encode any special chars present in the password which can't be directly passed in to MongoClient.connect

// Do NOT encode the cluster address or app name
const clusterAddress = process.env.DB_CLUSTER_ADDRESS;
const appName = process.env.DB_APP_NAME;
const collectionName = process.env.DB_COLLECTION_NAME;
const url = `mongodb+srv://${user}:${password}@${clusterAddress}/${collectionName}?appName=${appName}`;

module.exports = {
    url,
}