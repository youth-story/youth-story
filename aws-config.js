// aws-config.js

const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: 'AKIAQMXUEDBUJUHNVKHO',
  secretAccessKey: 'ZHGFXj3N0iXUj9tEqJniSJjpHE9YGFpEC1NG3+CH',
  region: 'us-east-1' // Replace with your desired AWS region
});

module.exports = AWS;
