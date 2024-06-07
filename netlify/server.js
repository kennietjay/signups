const server = require("../../server/server.js");
const serverless = require("serverless-http");

module.exports.handler = serverless(server);
