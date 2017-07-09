'use strict';

var express = require('express')
const winston = require('winston')
var anaMongoTotal = require('../analysis/mongodb/index.js')
var anaMongo = anaMongoTotal.ana
var anaNeo4J = require('../analysis/neo4j/index.js')
var Web3 = require('web3')
var web3 = new Web3()
const redis = require('redis')

var client = redis.createClient()
const port = 3000

winston.level = "debug";

client.on("error", err => {
    winston.error(err)
})

let validateAddress = (req, res, next) => {
    let address = req.params.address || ""
    if(!address.startsWith("0x")){
        address = "0x" + address
    }
    if(web3.isAddress(address)){
        next()
    } else {
        res.status(400).send(req.params.address + " is not a valid Ethereum address!")
    }
}

let bootstrap = function () {
    let baseApp = express()

    baseApp.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    baseApp.get('/:address', validateAddress, (req, res) => {
        let address = req.params.address
        client.get(address, (error, result) => {
            if(error){
                res.send(error)
            } else {
                if(!result){
                    res.send('Nothing found')
                    client.set(address, "Address: " + address, redis.print)
                } else {
                    res.send(result)
                }
            }
        })
    });

    baseApp.get('/graph/:address', validateAddress, (req, res) => {
        let addressGraph = "graph-" + req.params.address ;
        client.get(addressGraph, (error, result) => {
            if(error){
                res.send(error)
            } else {
                if(!result){
             //   if(!false){
                    // TODO: if the cached record is bigger than a certain time threshold, get it new from Neo4j
                    anaNeo4J.getGraphForAccount(req.params.address).then(graph => {
                        let graphData = graph;
                        client.set(addressGraph, JSON.stringify(graphData), redis.print);
                        res.send(graphData);
                    }).catch(err => {
                        winston.log('error', 'P2B2backend - Could not fetch Graph for account', err);
                        res.status(400).send('Something broke!');
                    });
                } else {
                    res.send(result)
                }

            }
        })
    });

    baseApp.get('/:address/totalValue', validateAddress, (req, res) => {
        let address = req.params.address
        client.get("totalValue:" + address, (error, result) => {
            if(error){
                res.send(error)
            } else {
                if(!result){
                    anaMongo.runAnalysis(anaMongoTotal.jobs[1], {
                        map: {
                            query: {
                                "transactions.from": {
                                    $eq: address
                                }
                            }
                        },
                        result: {
                            query: {
                                "_id": address
                            },
                            limit: 1
                        }
                    })
                    .then(totalValue => {
                            let value = totalValue[0].value || "0"
                            client.set("totalValue:" + address, value, redis.print)
                            res.send(value)
                        }
                    )
                    .catch(error => {
                        res.send(error)
                    })
                } else {
                    winston.info("Read from cache: " , result)
                    res.send(result)
                }
            }
        })
    })

    baseApp.listen(port, ()=>{
        winston.info("Backend listening at port " + port)
    })

    winston.info("Backend started" )
}

let promiseArray = [anaMongo.init(), anaNeo4J.connect()]
Promise.all(promiseArray).then(bootstrap).catch(err => {
    winston.log('error', 'P2B2backend - could not establish connection to the database:', {
        error: err.message
    });
});