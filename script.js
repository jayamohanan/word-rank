// Game State
let wordsData = [];
let currentRound = 1;
let currentWords = [];
let isAnswered = false;

// DOM Elements
const word1Btn = document.getElementById('word1');
const word2Btn = document.getElementById('word2');
const feedbackDiv = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const roundNumber = document.getElementById('roundNumber');

// Initialize Game
async function initGame() {
    try {
        const response = await fetch('word-rank.json');
        wordsData = await response.json();
        console.log(`Loaded ${wordsData.length} words`);
        startNewRound();
    } catch (error) {
        console.error('Error loading word data:', error);
        feedbackDiv.textContent = 'Error loading game data. Please refresh.';
        feedbackDiv.style.color = '#ff4444';
    }
}

// Get two random words
function getRandomWords() {
    const shuffled = [...wordsData].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
}

// Start a new round
function startNewRound() {
    // Reset state
    isAnswered = false;
    currentWords = getRandomWords();
    
    // Update UI
    word1Btn.querySelector('.word-text').textContent = currentWords[0].lemma;
    word2Btn.querySelector('.word-text').textContent = currentWords[1].lemma;
    
    // Reset styles
    word1Btn.className = 'word-tile';
    word2Btn.className = 'word-tile';
    word1Btn.disabled = false;
    word2Btn.disabled = false;
    
    // Clear feedback
    feedbackDiv.textContent = '';
    feedbackDiv.className = 'feedback';
    
    // Hide next button
    nextBtn.style.display = 'none';
    
    // Update round number
    roundNumber.textContent = currentRound;
}

// Handle word selection
function handleWordClick(selectedIndex) {
    if (isAnswered) return;
    
    isAnswered = true;
    
    // Determine which word is more popular (lower rank = more popular)
    const selectedWord = currentWords[selectedIndex];
    const otherWord = currentWords[selectedIndex === 0 ? 1 : 0];
    const isCorrect = selectedWord.rank < otherWord.rank;
    
    // Find the correct word index
    const correctIndex = currentWords[0].rank < currentWords[1].rank ? 0 : 1;
    
    // Update UI based on result
    if (isCorrect) {
        feedbackDiv.textContent = '✓ Correct!';
        feedbackDiv.className = 'feedback correct';
        
        // Highlight selected word as correct
        if (selectedIndex === 0) {
            word1Btn.classList.add('correct');
        } else {
            word2Btn.classList.add('correct');
        }
    } else {
        feedbackDiv.textContent = '✗ Wrong!';
        feedbackDiv.className = 'feedback incorrect';
        
        // Highlight selected word as incorrect
        if (selectedIndex === 0) {
            word1Btn.classList.add('incorrect');
        } else {
            word2Btn.classList.add('incorrect');
        }
        
        // Highlight correct word
        if (correctIndex === 0) {
            word2Btn.classList.add('correct');
        } else {
            word1Btn.classList.add('correct');
        }
    }
    
    // Add rank information to feedback
    setTimeout(() => {
        feedbackDiv.innerHTML += `<br><small style="font-size: 0.9rem; color: #666;">
            "${currentWords[0].lemma}" (rank: ${currentWords[0].rank}) vs 
            "${currentWords[1].lemma}" (rank: ${currentWords[1].rank})
        </small>`;
    }, 500);
    
    // Disable buttons
    word1Btn.disabled = true;
    word2Btn.disabled = true;
    
    // Show next button
    nextBtn.style.display = 'inline-block';
}

// Handle next button click
function handleNextClick() {
    currentRound++;
    startNewRound();
}

// Event Listeners
word1Btn.addEventListener('click', () => handleWordClick(0));
word2Btn.addEventListener('click', () => handleWordClick(1));
nextBtn.addEventListener('click', handleNextClick);

// Start the game
initGame();
