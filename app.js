const express = require('express')
const app = express()
const path = require('path')

console.log(__dirname);

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, '/node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))
// app.use('/model/', express.static(path.join(__dirname, '/model')))
app.use('/model', express.static(path.join(__dirname, '/model')));
app.use('/images', express.static(path.join(__dirname, '/images')));

app.engine('html', require('ejs').renderFile);

const port1 = 3000;
app.listen(port1, () => {
    console.log(`Started clientSider server on ${port1}`)
});

app.get('/hello', (req, res) => {
    res.send('<h1>hello world</h1>');
})

app.get('/thankyou', (req, res) => {
    res.sendfile(__dirname + '/public/thankyou.html');
})

app.get('/survey', (req, res) => {
    const surveyId = req.query.surveyId;
    const question = req.query.question;
    res.render(__dirname + "/public/survey.html", {question:question, surveyId:surveyId});
})

app.get('/passVar', function(req, res) {
    var question = 'akshay';
    // res.render(__dirname + '/public/test.html');
    res.render(__dirname + "/public/test.html", {question:question});
  });
