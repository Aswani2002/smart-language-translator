document.addEventListener('DOMContentLoaded', () => {
    // const signinBtn = document.querySelector('.signin-btn');
    // const signupBtn = document.querySelector('.signup-btn');
    const signupModal = document.getElementById('signupModal');
    const closeBtn = document.querySelector('.close-btn');
    const signupForm = document.querySelector('.signup-form');

    signinBtn.addEventListener('click', () => {
        alert('Sign in functionality coming soon!');
    });

    // Updated signup click handler - removes alert
    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const translateBtn = document.getElementById('translateBtn');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    const startSpeech = document.getElementById('startSpeech');
    const speakOutput = document.getElementById('speakOutput');
    const swapLanguages = document.getElementById('swapLanguages');
    
    let recognition = null;
    try {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    } catch (e) {
        console.error('Speech recognition not supported');
    }
    
    const synth = window.speechSynthesis;

    // RTL language codes
    const rtlLanguages = ['ar', 'fa', 'he', 'ur'];

    // Function to update text direction
    function updateTextDirection(language, element) {
        const container = element.closest('.input-controls, .output-controls');
        if (container) {
            if (rtlLanguages.includes(language)) {
                container.classList.add('rtl-text');
                container.classList.remove('ltr-text');
            } else {
                container.classList.add('ltr-text');
                container.classList.remove('rtl-text');
            }
        }
    }

    // Enhanced speak function with better language support
    function speakText(text, lang) {
        if (synth.speaking) {
            synth.cancel();
            return;
        }

        if (text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Get available voices
            const voices = synth.getVoices();
            // Try to find a matching voice for the language
            const voice = voices.find(v => v.lang.startsWith(lang)) || 
                         voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
                         voices[0];
            
            if (voice) {
                utterance.voice = voice;
            }

            utterance.onstart = () => {
                speakOutput.classList.add('speaking');
            };

            utterance.onend = () => {
                speakOutput.classList.remove('speaking');
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                speakOutput.classList.remove('speaking');
            };

            synth.speak(utterance);
        }
    }

    if (recognition) {
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            inputText.value = transcript;
            startSpeech.classList.remove('listening');
            translateBtn.click(); // Auto translate after speech
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            startSpeech.classList.remove('listening');
        };

        startSpeech.addEventListener('click', () => {
            if (startSpeech.classList.contains('listening')) {
                recognition.stop();
                startSpeech.classList.remove('listening');
            } else {
                inputText.value = '';
                recognition.lang = sourceLanguage.value;
                recognition.start();
                startSpeech.classList.add('listening');
            }
        });
    } else {
        startSpeech.style.display = 'none';
    }

    speakOutput.addEventListener('click', () => {
        speakText(outputText.value, targetLanguage.value);
    });

    swapLanguages.addEventListener('click', () => {
        const tempLang = sourceLanguage.value;
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = tempLang;
        
        const tempText = inputText.value;
        inputText.value = outputText.value;
        outputText.value = tempText;
    });

    translateBtn.addEventListener('click', async () => {
        if (!inputText.value) return;

        translateBtn.disabled = true;
        translateBtn.textContent = 'Translating...';

        try {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage.value}&tl=${targetLanguage.value}&dt=t&q=${encodeURI(inputText.value)}`);
            const data = await response.json();
            
            if (data && data[0]) {
                const translatedText = data[0]
                    .map(item => item[0])
                    .join('');
                outputText.value = translatedText;
            }
        } catch (error) {
            console.error('Translation error:', error);
            outputText.value = 'Translation error occurred. Please try again.';
        }

        translateBtn.disabled = false;
        translateBtn.textContent = 'Translate';
    });

    // Update event listeners
    sourceLanguage.addEventListener('change', () => {
        updateTextDirection(sourceLanguage.value, inputText);
        if (recognition) {
            recognition.lang = sourceLanguage.value;
        }
    });

    targetLanguage.addEventListener('change', () => {
        updateTextDirection(targetLanguage.value, outputText);
    });

    // Initialize text direction
    updateTextDirection(sourceLanguage.value, inputText);
    updateTextDirection(targetLanguage.value, outputText);

    // Load voices when available
    window.speechSynthesis.onvoiceschanged = () => {
        const voices = synth.getVoices();
        console.log('Available voices:', voices.length);
    };

    // Close modal when clicking close button
    closeBtn.addEventListener('click', () => {
        signupModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal when clicking outside
    signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Handle form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Here you would typically send the data to a server
        console.log('Form submitted:', formData);
        alert('Account created successfully!');
        signupModal.style.display = 'none';
        document.body.style.overflow = '';
        signupForm.reset();
    });
});
