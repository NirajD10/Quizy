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


/**
 * This function represents to Retrieve Data from API and save session storage
 * @returns {void} - render DOM after finalize logic
 */
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

/**
 * This function represent as read and find sessionstorage item exists or not
 * @returns {boolean} - whether it exists will return true else false
 */
const ReadQuizData = () => {
    const JSONData = sessionStorage.getItem('quiz')

    if(JSONData === null){
        return true
    } else {
        return false
    }
}

/**
 * Saves an array of objects to session storage under the given name.
 * @param {string} name - The key under which the data will be stored in sessionStorage.
 * @param {Array<Object>} item - An array of object data to be stored.
 * @returns {void}
 */
const saveQuizStorage = (name, item) => {
    return sessionStorage.setItem(name,JSON.stringify(item))
}


/**
 * Fetches a quiz from the Open Trivia Database API.
 *
 * Makes an HTTP request to retrieve 10 easy multiple-choice questions.
 * On success, returns the data as a JSON-formatted string.
 * On failure, logs the error and displays a message in the UI.
 *
 * @returns {Promise<string|undefined>} A promise that resolves to a JSON string of quiz data, or `undefined` if an error occurs.
 */
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
    }
    
}


/**
 * Initializes quiz objects, shuffles answers, encrypts the correct answer,
 * and saves the quiz list to session storage.
 *
 * @param {Array<Object>} quiz - The quiz data retrieved from the API.
 * @returns {void}
 */
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

/**
 * Retrieve data from session storage base on key
 * if found, will return to parsed JSON data,
 * otherwise will return empty array
 * @param {string} items - A key for retrieve session storage data
 * @returns {void | Array[]}
 */
const storeVariablefromStorage = (items) => {
    const quizt = sessionStorage.getItem(items)

    if(quizt === null){
        return []
    } else {
        return JSON.parse(quizt)
    }

}


/**
 * This function represent to render update DOM
 * @returns {void}
 */
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

/**
 * replace html encoding string into string text.
 * @param {string} str 
 * @returns {string}
 */
const htmlEntities = (str) =>{
    return str.replaceAll('&quot;','\"').replaceAll('&amp;','\&').replaceAll('&#039;','\'').replaceAll('&eacute;','É').replaceAll('&rsquo;','\'')
}


/**
 * The function update data results of currentpage, correct and incorrect points
 * @returns {void}
 */    
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

/**
 * A function to render UI for currentpage, correct and incorrect points
 * also update data in session Storage
 * @returns {void}
 */ 
const QuizzyrenderResults = () => {

    correctPoint.textContent = correctpoints
    incorrectPoint.textContent = incorrectpoints

    quizyResults[0].currentPage = questionNum
    quizyResults[0].correctP = correctpoints
    quizyResults[0].incorrectP = incorrectpoints

    saveQuizStorage('quizzygame',quizyResults)
}

/**
 * A function to retrieve from session storage and fetch current stage questions
 * @returns {number} - fetch current stage question number
 */
const renderCurrentPage = () => {
    const checkcurrentpage = sessionStorage.getItem('quizzygame')
    
    if(checkcurrentpage != null){
        const getpageNum = JSON.parse(checkcurrentpage)
        return getpageNum[0].currentPage
    } else {
        return 0
    }

}

/**
 * A function to fetch specific type of points from session storage
 * @param {string} options 
 * @returns {number} - points
 */
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

/**
 * This function represent Fisher-Yeates Shuffle Alogrithm for array shuffle
 * @param {Array<string>} answerSet 
 * @returns {Array<string>} - shuffled questions and answer including in array
 */
const shuffle = (answerSet) => {
    let currentPosition = answerSet.length, randomPosition
    
    while(currentPosition != 0){
        randomPosition = Math.floor(Math.random() * currentPosition)
        currentPosition--

        [answerSet[currentPosition], answerSet[randomPosition]] = [answerSet[randomPosition], answerSet[currentPosition]]
    }

    return answerSet
}

/**
 * Checks the selected answer against the correct answer for the current question.
 * Updates the UI to reflect whether the selected answer is correct or incorrect.
 * Also manages question progression and scoring.
 *
 * @param {HTMLInputElement} answerRadio - The selected radio button input element.
 * @param {Array<Object>} quizSet - The list of quiz questions with encrypted correct answers.
 * @returns {void}
 */
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

/**
 * To display UI Modal to call game gover
 * @returns {void}
 */
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

 
