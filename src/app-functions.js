import CryptoJS from 'crypto-js'
import swal from 'sweetalert';
import { quizSet, quizyResults, mcqAnswer } from './index'

const errorText = document.createElement('p')
const question = document.querySelector('#questions')
const mcqLabel = document.querySelectorAll('#answer')
const questionModule = document.querySelector('#questions-module')
const correctPoint = document.querySelector('#correct-points')
const incorrectPoint = document.querySelector('#incorrect-points')

let questionNum 
let correctpoints
let incorrectpoints


//Retrieve Data from API and save session storage
const retrieveData = async () => {
    if(ReadQuizData() === true){
        const quizData = await getQuiz()
        const quiz = await JSON.parse(quizData)
        initializeObjects(quiz.results)
        renderDOM()
    } else {
        renderDOM()
    }
}

//Read and check sessionstorage item is have or not
const ReadQuizData = () => {
    const JSONData = sessionStorage.getItem('quiz')

    if(JSONData === null){
        return true
    } else {
        return false
    }
}

//save session storage
const saveQuizStorage = (name, item) => {
    return sessionStorage.setItem(name,JSON.stringify(item))
}

//fetch question api
const getQuiz = async () => {
    try{
        const response = await fetch('https://opentdb.com/api.php?amount=10&difficulty=easy&type=multiple')

        if(response.status === 200){
            const data = await response.json()
            const JSONData = JSON.stringify(data)
            return JSONData
        }
        
    } catch (err){
        console.log(err)
        errorText.style.fontSize = '1rem'
        errorText.style.textAlign = 'center'
        errorText.textContent = "Cannot Fetch Data. Please try again Later."
        document.querySelector('.container').appendChild(errorText)
        //TODO: Disable other container and visible only error.
    }
    
}

//get question api and initilize new array-objects
const initializeObjects = (quiz) =>{
    quiz.forEach(element => {
        let answerSet = element.incorrect_answers
        answerSet = [...answerSet , element.correct_answer]

        // answerSet.push(element.correct_answer)
        shuffle(answerSet)

        const answerEncrypted = CryptoJS.AES.encrypt(element.correct_answer, 'quizy').toString()
        quizSet.push({
            question: element.question,
            correct_answer: answerEncrypted,
            answer: answerSet
        })
    });

    saveQuizStorage('quiz',quizSet)
}

//get items from sessionstorage
const storeVariablefromStorage = (items) => {
    const quizt = sessionStorage.getItem(items)

    if(quizt === null){
        return []
    } else {
        return JSON.parse(quizt)
    }

}


//render all dom questions and answer
const renderDOM = () => {
    
    if(questionNum === 0){
        updateQuizzyResults()
    }

    QuizzyrenderResults()

    //enable radio input
    mcqAnswer.forEach((element) => {
        element.disabled = false
    })


    let count = 0

    questionModule.textContent = `Question ${questionNum+1} (remaining ${10 - (questionNum + 1)})`
    question.textContent = htmlEntities(quizSet[questionNum].question)

    mcqAnswer.forEach((element) => {
        element.value = quizSet[questionNum].answer[count]
        count++
    })

    count = 0
    mcqLabel.forEach((element) => {
        element.textContent = quizSet[questionNum].answer[count]
        count++
    })
}

//replace encoding to string questions text.
const htmlEntities = (str) =>{
    return str.replaceAll('&quot;','\"').replaceAll('&amp;','\&').replaceAll('&#039;','\'').replaceAll('&eacute;','É').replaceAll('&rsquo;','\'')
}

//update quizzy currentpage, correct and incorrect points 
    
const updateQuizzyResults = () =>{

    if(sessionStorage.getItem('quizzygame')){
        return
    } else {
        correctPoint.textContent = correctpoints
        incorrectPoint.textContent = incorrectpoints
        quizyResults.push({
            currentPage: questionNum,
            correctP: correctpoints,
            incorrectP: incorrectpoints
        })

        saveQuizStorage('quizzygame', quizyResults)
    }
    
}

//render quizzy currentpage, correct and incorrect points 
const QuizzyrenderResults = () => {

    correctPoint.textContent = correctpoints
    incorrectPoint.textContent = incorrectpoints

    quizyResults[0].currentPage = questionNum
    quizyResults[0].correctP = correctpoints
    quizyResults[0].incorrectP = incorrectpoints

    saveQuizStorage('quizzygame',quizyResults)
}

//render and fetch 'questionNum' for current page when we referesh it
const renderCurrentPage = () => {
    const checkcurrentpage = sessionStorage.getItem('quizzygame')
    
    if(checkcurrentpage != null){
        const getpageNum = JSON.parse(checkcurrentpage)
        return getpageNum[0].currentPage
    } else {
        return 0
    }

}

//fetch game points from SessionStorage
const renderQuizyPoints = (options) => {
    const checkpoints = sessionStorage.getItem('quizzygame')

    if(checkpoints != null){
        const getgamepoints = JSON.parse(checkpoints)
        if(options === 'correctP'){
            return getgamepoints[0].correctP
        } else {
            return getgamepoints[0].incorrectP
        }
        
    } else {
        return 0
    }

}

//Fisher-Yeates Shuffle Alogrithm for array shuffle
const shuffle = (answerSet) => {
    let currentPosition = answerSet.length, randomPosition
    
    while(currentPosition != 0){
        randomPosition = Math.floor(Math.random() * currentPosition)
        currentPosition--

        [answerSet[currentPosition], answerSet[randomPosition]] = [answerSet[randomPosition], answerSet[currentPosition]]
    }

    return answerSet
}

//to check answer is correct or not.
const checkAnswer = (answerRadio , quizSet) => {
     
    const bytes = CryptoJS.AES.decrypt(quizSet[questionNum].correct_answer,'quizy')
    const answerText = bytes.toString(CryptoJS.enc.Utf8)


    if(answerRadio.value === answerText){
        document.querySelector(`input[value="${answerRadio.value}"]:checked`).nextElementSibling.classList.add('active')
        questionNum++
        correctpoints++

        if(questionNum < 10){

            setTimeout(()=>{
                document.querySelector(`input[value="${answerRadio.value}"]:checked`).nextElementSibling.classList.remove('active')
                mcqAnswer.forEach((element)=>{
                    element.checked = false
                })
                renderDOM()
                    
            },1500)

        } else {
            gameover()
        }
        

    } else {
        document.querySelector(`input[value="${answerRadio.value}"]:checked`).nextElementSibling.classList.add('incorrect')
        document.querySelector(`input[value="${answerText}"]`).nextElementSibling.classList.add('active')
        questionNum++
        incorrectpoints++
        
        if(questionNum < 10){
            setTimeout(()=>{
                document.querySelector(`input[value="${answerRadio.value}"]:checked`).nextElementSibling.classList.remove('incorrect')
                document.querySelector(`input[value="${answerText}"]`).nextElementSibling.classList.remove('active')
                    mcqAnswer.forEach((element)=>{
                        element.checked = false
                    }) 
                    renderDOM()
                        
            },1500)
            
    
        } else {
            gameover()
        }
        
    }
}

//To modal up 'Game over'
const gameover = () => {
    swal({
        title: 'Game Over',
        text: `You have scored ${correctpoints} out of ${questionNum} `,
        button: 'Restart Game',
    }).then(()=>{
        window.location.reload()
        sessionStorage.clear('quiz')
        sessionStorage.clear('quizzygame')
    })
}

questionNum = renderCurrentPage()
correctpoints = renderQuizyPoints('correctP')
incorrectpoints =  renderQuizyPoints('incorrectP')

export { retrieveData, getQuiz, storeVariablefromStorage, checkAnswer, gameover, questionNum} 

 