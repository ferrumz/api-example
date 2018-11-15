const express = require('express')
const mysql = require('mysql')
const app = express()
const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')

const dotenv = require('dotenv')
const config = dotenv.config().parsed

app.use(basicAuth({
    users: { [config.AUTH_NAME] : config.AUTH_PASS }
}))
app.use(bodyParser.json())

// connection configurations
const pool = mysql.createPool({
    connectionLimit : 10,
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
});



// default route
app.get('/', function (req, res) {
    return res.send({ error: true, message: 'hello' })
});

app.listen(config.APP_PORT, function () {
    console.log('app is running on port ' + config.APP_PORT)
});

// GET payload
app.get('/payload/:id', function (req, res) {

    let payload_id = req.params.id;

    if (!payload_id) {
        return res.status(400).send({ error: true, message: 'Please provide id' })
    }

    pool.getConnection(function (err, conn) {
        if (err) {
            return res.status(500).send({ error:true, message: 'Cannot connect DB' })
        }
        conn.query('SELECT * FROM payloads where id=?', payload_id, function (error, results) {
            if (error) throw error;
            conn.release()
            return res.send({ error: false, data: results[0] })
        })
    })

});


// POST
app.post('/payload', function (req, res) {
    let payload = req.body.payload;
    if (!payload) {
        return res.status(400).send({ error:true, message: 'Please provide payload' })
    }

    pool.getConnection(function (err, conn) {
        if (err) {
            return res.status(500).send({ error:true, message: 'Cannot connect DB' })
        }
        conn.query("INSERT INTO payloads SET ? ", { payload: payload }, function (error, results) {
            if (error) throw error;
            conn.release()
            return res.send({ error: false, data: results, message: 'New payload has been created successfully.' })
        });
    })

});

// PUT
app.put('/payload/:id', function (req, res) {
    let payload_id = req.params.id;
    let payload = req.body.payload;

    if (!payload_id || !payload) {
        return res.status(400).send({ error: task, message: 'Please provide id and payload' })
    }

    pool.getConnection(function (err, conn) {
        if (err) {
            return res.status(500).send({ error:true, message: 'Cannot connect DB' })
        }
        conn.query("UPDATE payloads SET payload = ? WHERE id = ?", [payload, payload_id], function (error, results) {
            if (error) throw error
            conn.release()
            return res.send({ error: false, data: results, message: 'Payload has been updated successfully.' })
        })

    })


})

// DELETE
app.delete('/payload/:id', function (req, res) {
    let payload_id = req.params.id;

    pool.getConnection(function (err, conn) {
        if (err) {
            return res.status(500).send({ error:true, message: 'Cannot connect DB' })
        }
        conn.query('DELETE FROM payloads WHERE id = ?', [payload_id], function (error, results) {
            if (error) throw error;
            conn.release()
            return res.send({ error: false, data: results, message: 'Payload has been updated successfully.' })
        })
    })

})

// 404
app.all("*", function (req, res, next) {
    return res.send('404 page not found')
    next();
});