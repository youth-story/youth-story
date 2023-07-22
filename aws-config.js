// aws-config.js

const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region // Replace with your desired AWS region
});

module.exports = AWS;
