
async function getQuestion(surveyId) {
    const responsejson = await fetch(
        "http://3.110.115.83:3002/getQuestion?surveyId=" + surveyId  
    );

    const data = await responsejson.json()
    console.log('json response:', data);

    return data.result.question;
}

document.getElementById("submit").addEventListener("click", async function() {
    console.log('survey submit clicked');
    const surveyId = document.getElementById("surveyId").value;
    const question = await getQuestion(surveyId);

    location.href = "/survey?question=" + question + '&surveyId=' + surveyId;

    console.log('question:', question);
});
