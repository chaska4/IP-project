const express = require('express');
const router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var dbConfig;

fs.readFileSync( './dbconfig.xml', function(err, data) {
    if (err) throw err;
        parser.parseString(data, function (err, result) {
            if (err) throw err;
            dbConfig = result;
	    createConn();
  });
});

function createConn() {
var dbCon = mysql.createConnection({
    host: dbConfig.dbconfig.host[0],
    user: dbConfig.dbconfig.user[0],               // replace with the database>
    password: dbConfig.dbconfig.password[0],           // replace with the data>
    database: dbConfig.dbconfig.database[0],           // replace with the data>
    port: dbConfig.dbconfig.port[0]
  });

  dbCon.connect(function(err) {
    if (err) throw err;
  });

  module.exports = dbCon;
}
