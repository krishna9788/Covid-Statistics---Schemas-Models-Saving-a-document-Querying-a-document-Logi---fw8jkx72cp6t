const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');
const { json } = require('express');

app.get("/totalRecovered", async(req, resp)=>{
    const totalRecovered = await connection.aggregate([
        {$group:{_id:"total",recovered:{$sum:"$recovered"}}}
    ])
        resp.status(200).json({
            data:{_id: totalRecovered}
        })

    })

// })

app.get("/totalActive", async(req, resp)=>{
    const totalActive = await connection.aggregate([
        {$group : {_id: 'total', infected:{$sum: "$infected"}}}
    ])
        resp.status(200).json({
            totalActive
        })
    })

app.get("/totalDeath", async(req, resp)=>{
        const totalDeath = await connection.aggregate([
            {$group: {_id:"total",death: {$sum: "$death"}}}
        ])
        resp.status(200).json({
            totalDeath
        })
    })

app.get("/hotspotStates", async(req, resp)=>{
    const hotspotStates = await connection.aggregate([
        {
            $project:{
                recovered:1,
                infected:1,
                state:1,
                hotspot:{
                    $subtract:["$infected","$recovered"]
                }
            }
        },
        {
            $project:{
                hotspot:1,
                infected:1,
                state:1,
                rate:{
                    $divide:["$hotspot","$infected"]
                }
            }
        },
        {
            $match:{
                rate:{$gt:0.1}
            }
        },
        {
            $project:{
                _id:0
                ,state:1,
                rate:{$round:["$rate",5]}
            }
        }
    ])
    resp.status(200).json({
        hotspotStates
    })

    })

app.get("/healthyStates", async(req, resp)=>{
    const healthyStates = await connection.aggregate([
        {
            $project:{
                death:1,
                infected:1,
                state:1,
                mortality:{
                    $divide:["$death","$infected"]
                }
            }
        },
        {
            $match:{
                mortality:{$lt:0.005}
            }
        },
        {
            $project:{
                _id:0,
                state:1,
                mortality:{
                    $round:["$mortality",5]
                }
            }
        }
    ]);
    resp.status(200).json({healthyStates})

})




app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;
