// import fetch from "node-fetch";
// const fetch = require('node-fetch');	//npm install node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var bodyParser = require('body-parser')

const express = require('express');
const app2 = express();
const port2 = 3002;
const cors = require('cors');

var jsonParser = bodyParser.json()


app2.use(cors({
    origin: '*'
}));

// // parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// // parse application/json
// app.use(bodyParser.json())

app2.listen(port2, () => {
    console.log(`Started serverSide server on ${port2}`);   
});

app2.get('/hello', (req, res) => {
    res.send('hello world');
})

app2.get('/testput', async (request, response) => {
    // POST request using fetch with async/await
    const score = "2";
    const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
        {   
            "surveyId": "90110",
            "score": String(score)
        }
        ),
    };
    const responsejson = await fetch(
      "https://2l3r2dng24.execute-api.ap-south-1.amazonaws.com/TEST/surveyresults",
      requestOptions
    );
    const data = await responsejson.json();
    response.json(data);
    // console.warn(response);
});

app2.put('/testrealput', jsonParser, async function(request, response) {

    const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request.body),
    };
    const responsejson = await fetch(
      "https://2l3r2dng24.execute-api.ap-south-1.amazonaws.com/TEST/surveyresults",
       requestOptions
    );
    const data = await responsejson.json();
    console.log('data:', data);
    response.json(data);
});

app2.get('/getQuestion', jsonParser, async function(request, response) {
    // response.send("surveyId is set to " + request.query.surveyId);
    const surveyId = request.query.surveyId;

    const responsejson = await fetch(
        'https://2l3r2dng24.execute-api.ap-south-1.amazonaws.com/TEST/surveyresults?surveyId=' + surveyId
    );

    const data = await responsejson.json()
    console.log('json response:', data); 
    response.json(data);
});

