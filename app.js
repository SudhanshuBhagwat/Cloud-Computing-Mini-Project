let express = require('express');
let bodyparser = require('body-parser');
let fs = require('fs');
let mysql = require('mysql');
let path = require('path');
let multer = require('multer');
let encryptor = require('file-encryptor');

let key = 'sid';

let app = express();
let PORT = 3333;
let loggedIn = false;
let directory = './uploads';

let users_db = mysql.createConnection({
    insecureAuth: true,
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'users'
});

users_db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Database connected...');
});

let storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

let upload = multer({
    storage: storage
}).single('file');

app.use(bodyparser.urlencoded());
app.use(bodyparser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get('/', (req, res) => {
    let sql = 'SELECT _ID, name FROM documents';
    let query = users_db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('index', {
            results: result
        });
    });
});

app.post('/login', (req, res) => {
    let user = {
        id: req.body.ip,
        pass: req.body.pass
    }
    let sql_search = 'SELECT IP, PASSWORD FROM users WHERE IP = ?';
    let query = users_db.query(sql_search, user.id, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            loggedIn = false;
            res.render('index', {
                loggedIn: loggedIn
            });
        } else {
            loggedIn = true;
            res.render('index', {
                loggedIn: loggedIn
            });
        }
    });
});

app.post('/register', (req, res) => {
    let user = {
        id: req.body.ip,
        pass: req.body.pass
    }
    let sql_insert = 'INSERT INTO users SET ?';
    let query = users_db.query(sql_insert, user, (err, result) => {
        if (err) throw err;
        res.render('index');
    });
});

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            throw err;
        } else {
             encryptor.encryptFile(`./uploads/${req.file.originalname}`, `./uploads/${req.file.originalname}.dat`, key, { algorithm: 'aes256' }, err =>  {
                if(err) throw err;
                console.log("Encryption done.");
                fs.unlink(`./uploads/${req.file.originalname}`, err => {
                    console.log(err);
                })
              });
            let sql_insert = 'INSERT INTO documents SET ?';
            let document = {
                path: req.file.path,
                name: req.file.originalname,
                hash_key: 'sample'
            }
            let query = users_db.query(sql_insert, document, (err, result) => {
                if (err) throw err;
                res.redirect('/');
            });
        }
    });
});

app.get('/delete', (req, res) => {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
    let sql_delete = 'DELETE FROM documents';
    let query = users_db.query(sql_delete, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.post('/download', (req, res) => {
    let id = req.body.id;
    let sql = 'SELECT name FROM documents WHERE _ID = ?';
    let query = users_db.query(sql, id, (err, result) => {
        let fileName = result[0].name;
        encryptor.decryptFile(`./uploads/${result[0].name}.dat`, `./downloads/${result[0].name}`, key, { algorithm: 'aes256' },function(err) {
            console.log('Done decrypting...');
            res.sendFile(path.join(__dirname) + `/downloads/${result[0].name}`, {
                headers: {
                    "Content-Dispositon":`attachment, filename=${result[0].name}`
                }
            });
          });
    });
});

app.listen(PORT, () => {
    console.log(`Listening at ${PORT}`);
});