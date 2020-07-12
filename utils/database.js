const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

let _db

const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://ivan:a753951852@cluster0.y90jh.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected')
            _db = client.db()
            callback(client)
        })
        .catch(err => {
            console.log(err)
            throw err
        })
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    else {
        throw "No DB"
    }
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb