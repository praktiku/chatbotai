class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            /** Pilihan Untuk Chat Atau Pakai Suara */
            toogleInput: document.querySelector('.toogle__input'),
            /** Button Untuk Mengambil Suara */
            speechButton: document.querySelector('.speech__button')
        }

        this.state = false;
        this.onSpeech = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton, toogleInput, speechButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        /** Pilihan Untuk Chat Atau Pakai Suara */
        toogleInput.addEventListener('change', () => this.toogleInput(chatBox))

        /** Button Untuk Mengambil Suara */
        speechButton.addEventListener('click', () => this.onSpeechButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
    /** Pilihan Untuk Chat Atau Pakai Suara */
    toogleInput(chatBox){
        const select = chatBox.querySelector('select[name="toogleInput"]')
        const input = chatBox.querySelector('input')
        const buttonSpeech = chatBox.querySelector('.speech__button')
        const buttonSend = chatBox.querySelector('.send__button')
        if(select.value != 'chat'){
            input.style.display = 'none'
            buttonSend.style.display = 'none'
            buttonSpeech.style.display = 'block'
            
            
        }else{
            input.style.display = 'block'
            buttonSend.style.display = 'block'
            buttonSpeech.style.display = 'none'
            
        }
    }

    /** Button Untuk Mengambil Suara */
    onSpeechButton(chatBox){
        this.onSpeech = !this.onSpeech
        const buttonSpeech = chatBox.querySelector('.speech__button')
        if(this.onSpeech){
            buttonSpeech.innerHTML = 'Listening...'
            this.speechOnListening()
        }else{
            buttonSpeech.innerHTML = 'Start Speech'
        }

        
    }
    /** Function Untuk Speech */
    speechOnListening(){
        /** Import Class Dari WebkitSpeechRecognition */

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'id';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        if(this.onSpeech){
            // recognition.start();
            console.log('SpeechOnListening')
            /** Class Recognition */
            this.recOnProgress(recognition) 
        }else{
            recognition.stop();
        }
        
    }
    /** Function Suara Buatan */
    synthOnProgress(speechMsg, recognition){
         /** Suara Buatan */
         console.log('synthOnProgress')
         const synth = window.speechSynthesis;
         let utter = new SpeechSynthesisUtterance();
         utter.lang = 'id-ID'
         utter.onend = () => {
            recognition.stop();
            console.log("utter onend")
        }
        setTimeout(() => {
            utter.text = speechMsg
            synth.speak(utter)
        }, 500);
        
    }
    /**Function get Speech */
    recOnProgress(recognition){
        /**  */
        const buttonSpeech = document.querySelector('.speech__button')
        console.log('recOnProgress')
        recognition.start()
        /** Ambil Hasil Suara Yang Telah Di Rekam */
        recognition.onresult = (event) => {
            
            buttonSpeech.innerHTML = 'Start Speech'
            recognition.stop()
            const resSpeech = event.results[event.results.length - 1][0].transcript.trim();
            console.log('Speech Request')
            /** Msg yang telah direkam dan recognition */
            this.getResponseFromBot(resSpeech, recognition)
            
            console.log(resSpeech);
        }
    }
    /** Function Untuk Response ChatBot */
    getResponseFromBot(speechVoice, recognition){
        let text1 = speechVoice
        let chatbox = document.querySelector('.chatbox__support')
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            /**Message, Class Recognition */
            this.synthOnProgress(r.answer, recognition) // 

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            
          });
    }

}


const chatbox = new Chatbox();
chatbox.display();