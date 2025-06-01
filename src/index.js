/**
 * @file Quizy Application
 * @author Niraj Deshmukh
 * @see <a href="https://github.com/NirajD10" target="_blank" rel="noopener noreferrer">Visit Github Profile</a>
 */

import swal from 'sweetalert';
import  { retrieveData,  storeVariablefromStorage, checkAnswer, gameover, questionNum} from './app-functions';

const mcqAnswer = document.querySelectorAll('input[name="answer"]')
const submitBtn = document.querySelector('#btn-submit')

let quizSet = []
let quizyResults = []

quizSet = storeVariablefromStorage('quiz')
quizyResults = storeVariablefromStorage('quizzygame')



if( questionNum < 10){

    submitBtn.addEventListener('click', (e)=> {
        e.preventDefault();
        const answerRadio = document.querySelector('input[name="answer"]:checked')
        if(answerRadio != null){
            mcqAnswer.forEach((element) => {
                element.disabled = true
            })
            checkAnswer(answerRadio, quizSet)
        }else {
            swal({
                title: 'No answer',
                text: 'You didn\'t select answer. Please select answer.',
                icon: 'warning',
                button: 'Ok',
            })
        }
        
    })

    retrieveData()
    
} else {
     gameover()
}


export { quizSet, quizyResults, mcqAnswer}