const { MongoStore } = require("connect-mongo");
const { url } = require('./db-util');
const sessionStore = new MongoStore({
  mongoUrl: url,
  collectionName: "sessions",
});

module.exports = {
    sessionStore,
}