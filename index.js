// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// Include the express module
const express = require('express');
const fs = require('fs');

// Helps in managing user sessions
const session = require('express-session');

// include the mysql module
var mysql = require('mysql');

// formidable
var formidable = require('formidable');

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// required for reading XML files
var xml2js = require('xml2js');

const port = 9015;

// create an express application
const app = express();

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// Use express-session
// In-memory session is sufficient for this assignment
app.use(session({
        secret: "csci4131secretkey",
        saveUninitialized: true,
        resave: false
    }
));

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));

// server listens on port set to value above for incoming connections
app.listen(port, () => console.log('Listening on port', port));

app.get('/',function(req, res) {
  res.sendFile(__dirname + '/client/welcome.html');
});

app.get('/Home',function(req, res) {
  if (!req.session.value) {
    res.redirect(302, '/login');
  } else {
    res.sendFile(__dirname + '/client/welcome.html');
  }
});

app.get('/Admin',function(req, res) {
  if (!req.session.value) {
    res.redirect(302, '/login');
  } else {
    res.sendFile(__dirname + '/client/Admin.html');
  }
});

// GET method route for the contacts page.
// It serves MyContacts.html present in client folder
app.get('/MyContacts', function(req, res) {
    // TODO: Add Implementation
    if (!req.session.value) {
      res.redirect(302, '/login'); 
    } else {
      res.sendFile(__dirname + '/client/MyContacts.html');
    }
});

app.get('/AllContacts', function(req, res) {
    // TODO: Add Implementation
    if (!req.session.value) {
      res.redirect(302, '/login');
    } else {
      res.sendFile(__dirname + '/client/AllContacts.html');
    }
});

app.get('/AddContact', function(req, res) {
    // TODO: Add Implementation
    if (!req.session.value) {
      res.redirect(302, '/login');
    } else {
      res.sendFile(__dirname + '/client/AddContact.html');
    }
});

app.get('/Stocks', function(req, res) {
    // TODO: Add Implementation
    if (!req.session.value) {
      res.redirect(302, '/login');
    } else {
      res.sendFile(__dirname + '/client/Stocks.html');
    }
});

// TODO: Add implementation for other necessary end-points

app.get('/login',function(req, res) {
  if (!req.session.value) {
    res.sendFile(__dirname + '/client/login.html');
  } else {
    res.sendFile(__dirname + '/client/AllContacts.html');
  }
});

app.post('/validate',function(req, res) {
  var formUser = req.body.username;
  var formPass = req.body.password;

  // Connection
  const dbCon = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131SN22U81",               // replace with the database user provi>
    password: "6611",           // replace with the database password provided >
    database: "C4131SN22U81",           // replace with the database user provi>
    port: 3306
  });

  console.log("Attempting database connection");
  dbCon.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log("Connected to database!");

    console.log("getAccount");
    dbCon.query('SELECT * FROM tbl_accounts WHERE acc_login = ?', formUser , function (err, rows) {
        if (err) {
            throw err;
        }
	if (rows.length > 0) {
	  for (const row of rows) {
	    var accLogin = row.acc_login;
	    var accPass = row.acc_password;
	    var matchUser = (accLogin == formUser);
            var matchPass = bcrypt.compareSync(formPass, accPass);
            if (matchPass && matchUser) {
              console.log("Successful authentication! Session being created.");
              req.session.value = 1;
	      res.json({status: 'success'});
            } else {
	      req.session.value += 1;
	      res.json({status: 'fail'});
            }
	  }
	} else {
	    res.json({status: 'fail'});
	}

    });
   });
});

app.post('/validateUser',function(req, res) {
  var formUser = req.body.username;
  var formPass = req.body.password;

  // Connection
  const dbCon = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131SN22U81",               // replace with the database user provi>
    password: "6611",           // replace with the database password provided >
    database: "C4131SN22U81",           // replace with the database user provi>
    port: 3306
  });

  console.log("Attempting database connection");
  dbCon.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log("Connected to database!");

    console.log("getAccount");
    dbCon.query('SELECT * FROM tbl_accounts WHERE acc_login = ?', formUser , function (err, rows) {
        if (err) {
            throw err;
        }
        if (rows.length > 0) {
          for (const row of rows) {
            var accLogin = row.acc_login;
            var matchUser = (accLogin == formUser);
            if (matchUser) {
              res.json({status: 'fail'});
            } else {
              res.json({status: 'success'});
            }
          }
        } else {
            res.json({status: 'success'});
        }

    });
   });
});

app.get('/getContacts', function(req, res) {
  const dbCon = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131SN22U81",               // replace with the database user provi>
    password: "6611",           // replace with the database password provided >
    database: "C4131SN22U81",           // replace with the database user provi>
    port: 3306
  });

  console.log("Attempting database connection");
  dbCon.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log("Connected to database!");

    console.log("getContacts");
    dbCon.query('SELECT * FROM contact_table ORDER BY contact_category ASC, contact_name ASC', function(err, rows) {
        if (err) {
            throw err;
        }
        if (rows.length > 0) {
	  var academicArray = [];
	  var industryArray = [];
	  var personalArray = [];
	  var allArray = [];
	  for (const row of rows) {
	      var category = row.contact_category.toLowerCase();
	      var contact = {
		"category" : row.contact_category,
                "name" : row.contact_name,
                "location" : row.contact_location,
                "info" : row.contact_info,
                "email" : row.contact_email,
                "website_title" : row.website_title,
                "url" : row.website_url
	      }; 
	      if (category == "academic") {
	        academicArray.push(contact);
	      } else if (category == "industry") {
	        industryArray.push(contact);
	      } else if (category == "personal") {
	        personalArray.push(contact);
	      }
	      allArray.push(contact);
	  }
	  var contacts = {
	    "academic" : academicArray,
	    "industry" : industryArray,
	    "personal" : personalArray,
	    "all" : allArray
	  }
	  res.json(contacts);
        } else {
	  res.json({status: 'fail'});
	}

    });
   });
});

app.get('/getAccounts', function(req, res) {
  const dbCon = mysql.createConnection({
    host: "cse-mysql-classes-01.cse.umn.edu",
    user: "C4131SN22U81",               // replace with the database user provi>
    password: "6611",           // replace with the database password provided >
    database: "C4131SN22U81",           // replace with the database user provi>
    port: 3306
  });

  console.log("Attempting database connection");
  dbCon.connect(function (err) {
    if (err) {
        throw err;
    }

    console.log("Connected to database!");

    console.log("getAccounts");
    dbCon.query('SELECT * FROM tbl_accounts', function(err, rows) {
        if (err) {
            throw err;
        }
        if (rows.length > 0) {
	  var accArr = [];
          for (const row of rows) {
              var account = {
                "id" : row.acc_id,
                "name" : row.acc_name,
                "login" : row.acc_login,
              }; 
              accArr.push(account);
          }
          res.json(accArr);
        } else {
          res.json({status: 'fail'});
        }

    });
   });
});

app.post('/postContactEntry', function(req, res) {
    post = req.body;

      const dbCon = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131SN22U81",               // replace with the database user provi>
        password: "6611",           // replace with the database password provided >
        database: "C4131SN22U81",           // replace with the database user provi>
        port: 3306
      });

      console.log("Attempting database connection");
      dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
	
	const rowToBeInserted = {
          contact_category: post.category,            // replace with acc_name chosen by you OR retain the same value
          contact_name: post.name,           // replace with acc_login chosen by you OR retain the same value
          contact_location: post.location,
	  contact_info: post.info,
	  contact_email: post.email,
	  website_title: post.website_title,
	  website_url: post.url
        };

        console.log("Connected to database!");

        console.log("insertContact");
        dbCon.query('INSERT contact_table SET ?', rowToBeInserted , function (err, rows) {
            if (err) {
                throw err;
            }
	    console.log("Inserted into contact table!");

        });
      });
  res.redirect(302, '/AllContacts');
});

app.post('/postUser', function(req, res) {
    post = req.body;

      const dbCon = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131SN22U81",               // replace with the database user provi>
        password: "6611",           // replace with the database password provided >
        database: "C4131SN22U81",           // replace with the database user provi>
        port: 3306
      });

      console.log("Attempting database connection");
      dbCon.connect(function (err) {
        if (err) {
            throw err;
        }
	const saltRounds = 10;
	const passwordHash = bcrypt.hashSync(post.password, saltRounds);
        
        const rowToBeInserted = {
          acc_name: post.name,           // replace with acc_login chosen by you OR retain the same value
          acc_login: post.login,
	  acc_password: passwordHash
        };

        console.log("Connected to database!");

        console.log("insertUser");
        dbCon.query('INSERT tbl_accounts SET ?', rowToBeInserted , function (err, rows) {
            if (err) {
                throw err;
            }
            console.log("Inserted into User table!");

        });
      });
  res.redirect(302, '/Admin');
});

app.post('/upload', (req, res, next) => {
  const form = formidable({multiples: true});
  let userJson = {};
  var acadArr = [];
  var induArr = [];
  var persArr = [];
  var allContacts = [];

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    fileList = files;
    fs.readFile(fileList.someExpressFiles.filepath, function (err, data) {
      if (err) {
	throw err;
      }
      var obj = JSON.parse(data);
      console.log(obj);
      acadArr = obj.academic;
      induArr = obj.industry;
      persArr = obj.personal;
      allContacts.push(acadArr);
      allContacts.push(induArr);
      allContacts.push(persArr);


      const dbCon = mysql.createConnection({
        host: "cse-mysql-classes-01.cse.umn.edu",
        user: "C4131SN22U81",               // replace with the database user provi>
        password: "6611",           // replace with the database password provided >
        database: "C4131SN22U81",           // replace with the database user provi>
        port: 3306
      });

      console.log("Attempting database connection");
      dbCon.connect(function (err) {
        if (err) {
            throw err;
        }

	for (const category of allContacts) {
	for (const row of category) {
	var catName;
	if (category == acadArr) {
	  catName = "Academic";
	} else if (category == induArr) {
	  catName = "Industry";
	} else if (category == persArr) {
	  catName = "Personal";
	}

        var rowToBeInserted = {
          contact_category: catName,
          contact_name: row.name,
          contact_location: row.location,
          contact_info: row.info,
          contact_email: row.email,
          website_title: row.website_title,
          website_url: row.url
        };

        console.log("Connected to database!");

        console.log("insertContact");
        dbCon.query('INSERT contact_table SET ?', rowToBeInserted , function (err, rows) {
            if (err) {
                throw err;
            }
            console.log("Inserted into contact table!");

        });
	}
	}
      });
    });
    res.redirect(302, '/AllContacts');
  });
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  console.log("Session destroyed!");
  res.redirect(302, '/login');
});

// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});



