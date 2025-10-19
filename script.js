// ============================================
// ACHIEVEMENTS TOGGLE
// Set to true to enable achievements, false to disable
// ============================================
const ACHIEVEMENTS_ENABLED = false;

// ============================================
// VIEWPORT HEIGHT FIX FOR MOBILE BROWSERS
// Fixes issues with 100vh on mobile (URL bars, etc.)
// ============================================
function setViewportHeight() {
    // Use window.innerHeight to get the actual visible height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initialize viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// ============================================
// GAME MODE CONFIGURATION
// ============================================
// GAME_MODE: 'levels', 'classic', or 'free'
let GAME_MODE = 'levels';
let classicLives = 3;
let classicScore = 0;
let classicHighScore = 0;

// Free mode state (no lives, no score, just infinite quiz)
// No extra state needed; just use GAME_MODE === 'free'

// Persistent level tracker
function getCurrentLevel() {
    return parseInt(localStorage.getItem('currentLevel') || '1', 10);
}
function setCurrentLevel(level) {
    localStorage.setItem('currentLevel', level);
}

// Classic mode high score
function getClassicHighScore() {
    return parseInt(localStorage.getItem('classicHighScore') || '0', 10);
}
function setClassicHighScore(score) {
    localStorage.setItem('classicHighScore', score);
}

// Level Progress Bar State
const LEVELS_PER_SET = 10;
let wordsData = [];
let currentLevel = getCurrentLevel();
let currentRound = (currentLevel - 1) * LEVELS_PER_SET + 1;
let currentWords = [];
let isAnswered = false;
let levelResults = []; // true for correct, false for incorrect

// DOM Elements - Pages
const homePage = document.getElementById('homePage');
const gamePage = document.getElementById('gamePage');
const levelsBtn = document.getElementById('levelsBtn');
const classicBtn = document.getElementById('classicBtn');
const freeBtn = document.getElementById('freeBtn');
const homeBtn = document.getElementById('homeBtn');
// --- Free Mode Logic ---
async function startFreeMode() {
    // Always reload word data before starting
    try {
        const response = await fetch('word-rank.json');
        wordsData = await response.json();
        console.log(`Reloaded ${wordsData.length} words for Free mode`);
    } catch (error) {
        console.error('Error loading word data:', error);
        feedbackDiv.textContent = 'Error: Game data not loaded. Please return to home and try again.';
        feedbackDiv.style.color = '#ff4444';
        return;
    }
    GAME_MODE = 'free';
    homePage.style.display = 'none';
    gamePage.style.display = 'block';
    // Close info modal if it's open
    if (infoModal) {
        infoModal.style.display = 'none';
    }
    // Hide levels UI elements
    levelProgressBar.style.display = 'none';
    levelNumberDiv.style.display = 'none';
    // Hide classic mode UI elements
    livesContainer.style.display = 'none';
    highScoreDisplay.style.display = 'none';
    currentScoreDisplay.style.display = 'none';
    // Start first round
    startNewRound();
}

// DOM Elements - Game
const word1Btn = document.getElementById('word1');
const word2Btn = document.getElementById('word2');
const feedbackDiv = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const roundNumber = document.getElementById('roundNumber');
const levelProgressBar = document.getElementById('levelProgressBar');
const levelNumberDiv = document.getElementById('levelNumber');

// DOM Elements - Classic Mode
const livesContainer = document.getElementById('livesContainer');
const livesDisplay = document.getElementById('livesDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const highScoreValue = document.getElementById('highScoreValue');
const currentScoreDisplay = document.getElementById('currentScoreDisplay');
const currentScoreValue = document.getElementById('currentScoreValue');

// --- Sound Effects (Mobile-Optimized) ---
let audioContext;
let correctSoundBuffer;
let incorrectSoundBuffer;
let audioInitialized = false;
let soundEnabled = true; // Sound is enabled by default

// Initialize AudioContext on first user interaction
function initAudio() {
    if (audioInitialized) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Load correct sound
        fetch('sounds/correct_answer.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(buffer => {
                correctSoundBuffer = buffer;
            })
            .catch(err => console.error('Error loading correct sound:', err));
        
        // Load incorrect sound
        fetch('sounds/incorrect_answer.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(buffer => {
                incorrectSoundBuffer = buffer;
            })
            .catch(err => console.error('Error loading incorrect sound:', err));
        
        audioInitialized = true;
    } catch (err) {
        console.error('Error initializing audio:', err);
    }
}

// Play sound buffer
function playSound(buffer) {
    if (!audioContext || !buffer || !soundEnabled) return;
    
    try {
        // Resume context if suspended (iOS requirement)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (err) {
        console.error('Error playing sound:', err);
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    const soundBtnHome = document.getElementById('soundBtnHome');
    
    // Update both buttons (home and game page)
    [soundBtn, soundBtnHome].forEach(btn => {
        if (btn) {
            if (soundEnabled) {
                btn.classList.remove('muted');
            } else {
                btn.classList.add('muted');
            }
        }
    });
    
    // Save preference to localStorage
    localStorage.setItem('soundEnabled', soundEnabled);
}

// Load sound preference from localStorage
function loadSoundPreference() {
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) {
        soundEnabled = saved === 'true';
        const soundBtn = document.getElementById('soundBtn');
        const soundBtnHome = document.getElementById('soundBtnHome');
        
        // Update both buttons
        if (!soundEnabled) {
            if (soundBtn) soundBtn.classList.add('muted');
            if (soundBtnHome) soundBtnHome.classList.add('muted');
        }
    }
}

// Initialize audio on first click/touch
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

// DOM Elements - Modal
const summaryModal = document.getElementById('summaryModal');
const summaryTitle = document.getElementById('summaryTitle');
const summaryScore = document.getElementById('summaryScore');
const summaryCorrect = document.getElementById('summaryCorrect');
const summaryWrong = document.getElementById('summaryWrong');
const summaryCloseBtn = document.getElementById('summaryCloseBtn');
const summaryButtons = document.getElementById('summaryButtons');

// Heart SVG icons
function getHeartSVG(broken = false) {
    if (broken) {
        return `<svg class="heart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            stroke="#ccc" stroke-width="2" fill="none" stroke-dasharray="4,4"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#ff4444" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
    } else {
        return `<svg class="heart-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            fill="#ff4444" stroke="#cc0000" stroke-width="2"/>
        </svg>`;
    }
}

// Update lives display
function updateLivesDisplay() {
    if (GAME_MODE !== 'classic') return;
    
    livesDisplay.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const heartDiv = document.createElement('div');
        heartDiv.innerHTML = getHeartSVG(i >= classicLives);
        livesDisplay.appendChild(heartDiv);
    }
}

// Initialize game mode
async function startLevelsMode() {
    // Always reload word data before starting
    try {
        const response = await fetch('word-rank.json');
        wordsData = await response.json();
        console.log(`Reloaded ${wordsData.length} words for Levels mode`);
    } catch (error) {
        console.error('Error loading word data:', error);
        feedbackDiv.textContent = 'Error: Game data not loaded. Please return to home and try again.';
        feedbackDiv.style.color = '#ff4444';
        return;
    }
    GAME_MODE = 'levels';
    homePage.style.display = 'none';
    gamePage.style.display = 'block';
    // Close info modal if it's open
    if (infoModal) {
        infoModal.style.display = 'none';
    }
    // Show levels UI elements
    levelProgressBar.style.display = 'flex';
    levelNumberDiv.style.display = 'block';
    // Hide classic mode UI elements
    livesContainer.style.display = 'none';
    highScoreDisplay.style.display = 'none';
    currentScoreDisplay.style.display = 'none';
    // Reset level progress
    currentLevel = getCurrentLevel();
    currentRound = 1;
    levelResults = [];
    renderLevelProgressBar();
    startNewRound();
}

async function startClassicMode() {
    // Always reload word data before starting
    try {
        const response = await fetch('word-rank.json');
        wordsData = await response.json();
        console.log(`Reloaded ${wordsData.length} words for Classic mode`);
    } catch (error) {
        console.error('Error loading word data:', error);
        feedbackDiv.textContent = 'Error: Game data not loaded. Please return to home and try again.';
        feedbackDiv.style.color = '#ff4444';
        return;
    }
    GAME_MODE = 'classic';
    homePage.style.display = 'none';
    gamePage.style.display = 'block';
    // Close info modal if it's open
    if (infoModal) {
        infoModal.style.display = 'none';
    }
    // Hide levels UI elements
    levelProgressBar.style.display = 'none';
    levelNumberDiv.style.display = 'none';
    // Show classic mode UI elements
    livesContainer.style.display = 'block';
    highScoreDisplay.style.display = 'block';
    currentScoreDisplay.style.display = 'flex';
    // Reset classic mode state
    classicLives = 3;
    classicScore = 0;
    classicHighScore = getClassicHighScore();
    highScoreValue.textContent = classicHighScore;
    currentScoreValue.textContent = classicScore;
    updateLivesDisplay();
    startNewRound();
}

function goHome() {
    gamePage.style.display = 'none';
    homePage.style.display = 'flex';
    summaryModal.style.display = 'none';
    // Close info modal if it's open
    if (infoModal) {
        infoModal.style.display = 'none';
    }
}

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

// Load word data on startup (but don't start game yet)
async function loadWordData() {
    try {
        const response = await fetch('word-rank.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        wordsData = await response.json();
        console.log(`Loaded ${wordsData.length} words`);
        
        // Ensure we're on the home page after loading
        initializeApp();
    } catch (error) {
        console.error('Error loading word data:', error);
        
        // Show error in the UI
        if (homePage) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'color: #ff4444; padding: 20px; text-align: center; font-weight: bold;';
            errorDiv.textContent = 'Error loading game data. Please refresh the page.';
            homePage.appendChild(errorDiv);
        }
    }
}

// Initialize app state
function initializeApp() {
    // Always show home page on load/reload
    if (homePage && gamePage) {
        homePage.style.display = 'flex';
        gamePage.style.display = 'none';
        if (summaryModal) {
            summaryModal.style.display = 'none';
        }
    }
}

// Get two random words
function getRandomWords() {
    const shuffled = [...wordsData].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
}

// Helper function to convert to Title Case
function toTitleCase(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Render the level progress bar for the current set
function renderLevelProgressBar() {
    if (!levelProgressBar || GAME_MODE !== 'levels') return;
    const setStart = Math.floor((currentRound - 1) / LEVELS_PER_SET) * LEVELS_PER_SET + 1;
    const setEnd = setStart + LEVELS_PER_SET - 1;
    levelProgressBar.innerHTML = '';
        for (let i = setStart; i <= setEnd; i++) {
                const circle = document.createElement('div');
                circle.classList.add('level-circle');
                if (i < currentRound) {
                        if (levelResults[i-1] === true) {
                                circle.classList.add('completed');
                                // Add white tick SVG
                                circle.innerHTML = `<span class='progress-icon'>
                                    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <path d='M3.5 7.5L6 10L10.5 4' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
                                    </svg>
                                </span>`;
                        } else if (levelResults[i-1] === false) {
                                circle.classList.add('wrong');
                                // Add white X SVG
                                circle.innerHTML = `<span class='progress-icon'>
                                    <svg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <path d='M4 4L10 10M10 4L4 10' stroke='white' stroke-width='2.2' stroke-linecap='round'/>
                                    </svg>
                                </span>`;
                        } else {
                                circle.classList.add('uncompleted');
                        }
                } else if (i === currentRound) {
                        circle.classList.add('current');
                } else {
                        circle.classList.add('uncompleted');
                }
                levelProgressBar.appendChild(circle);
        }
}

// Start a new round
function startNewRound() {
    // Validate that word data is loaded
    if (!wordsData || wordsData.length === 0) {
        console.error('Cannot start round: Word data not loaded!');
        feedbackDiv.textContent = 'Error: Game data not available.';
        feedbackDiv.style.color = '#ff4444';
        return;
    }
    
    // Update level number in UI (only for levels mode)
    if (GAME_MODE === 'levels') {
        const levelNumberDiv = document.getElementById('levelNumber');
        if (levelNumberDiv) levelNumberDiv.textContent = `Level ${currentLevel}`;
        // Reset game answers if starting first round of level
        if ((currentRound - 1) % LEVELS_PER_SET === 0) {
            currentGameAnswers = [];
        }
    } else if (GAME_MODE === 'free') {
        // Hide level number in free mode
        if (levelNumberDiv) levelNumberDiv.textContent = '';
    }
    
    // Reset state
    isAnswered = false;
    currentWords = getRandomWords();

    // Update UI
    word1Btn.querySelector('.word-text').textContent = toTitleCase(currentWords[0].lemma);
    word2Btn.querySelector('.word-text').textContent = toTitleCase(currentWords[1].lemma);

    // Reset styles
    word1Btn.className = 'word-tile';
    word2Btn.className = 'word-tile';
    word1Btn.disabled = false;
    word2Btn.disabled = false;

    // Clear feedback
    feedbackDiv.textContent = '';
    feedbackDiv.className = 'feedback';

    // Clear icons
    for (let i = 1; i <= 2; i++) {
        document.getElementById('icon' + i).innerHTML = '';
    }

    // Hide next button
    nextBtn.style.display = 'none';

    // Update level progress bar (only for levels mode)
    if (GAME_MODE === 'levels') {
        renderLevelProgressBar();
    }
    // In free mode, nothing to update
}

// Handle word selection
function handleWordClick(selectedIndex) {
    if (isAnswered) return;

    isAnswered = true;

    // Determine which word is most popular (lowest rank)
    const selectedWord = currentWords[selectedIndex];
    const correctIndex = currentWords.reduce((minIdx, word, idx, arr) => word.rank < arr[minIdx].rank ? idx : minIdx, 0);
    const isCorrect = selectedIndex === correctIndex;

    // Play sound feedback
    if (isCorrect) {
        playSound(correctSoundBuffer);
    } else {
        playSound(incorrectSoundBuffer);
    }

    // Handle classic mode
    if (GAME_MODE === 'classic') {
        if (isCorrect) {
            classicScore++;
        } else {
            classicLives--;
            updateLivesDisplay();
        }
        currentScoreValue.textContent = classicScore;
    } else if (GAME_MODE === 'levels') {
        // Handle levels mode
        levelResults[currentRound - 1] = isCorrect;
        currentGameAnswers.push(isCorrect);
    } else if (GAME_MODE === 'free') {
        // Free mode: nothing to update, just allow infinite play
    }
    
    // Update total correct count (only for achievements)
    if (isCorrect && ACHIEVEMENTS_ENABLED) {
        const totalCorrect = parseInt(localStorage.getItem('totalCorrect') || '0') + 1;
        localStorage.setItem('totalCorrect', totalCorrect);
    }

    // Track streaks (only if achievements enabled)
    if (ACHIEVEMENTS_ENABLED) {
        updateStreak(isCorrect);
    }

    // Sort words by rank ascending
    const sortedWords = [...currentWords].sort((a, b) => a.rank - b.rank);
    let rankHtml = '<div style="margin-top:10px;font-size:0.98rem;color:#555;font-weight:bold;text-align:center;">Word Frequency Rank</div>';
    rankHtml += '<div class="rank-list-horizontal" style="margin-top:2px;font-size:0.95rem;color:#888;font-weight:normal;text-align:center;">';
    for (let i = 0; i < sortedWords.length; i++) {
        rankHtml += `${toTitleCase(sortedWords[i].lemma)} #${sortedWords[i].rank}`;
        if (i < sortedWords.length - 1) rankHtml += ' &bull; ';
    }
    rankHtml += '</div>';

    // Only show the rank info, no correct/wrong label
    feedbackDiv.innerHTML = rankHtml;
    feedbackDiv.className = isCorrect ? 'feedback correct' : 'feedback incorrect';

    if (selectedIndex === 0) word1Btn.classList.add('correct');
    if (selectedIndex === 1) word2Btn.classList.add('correct');
    if (!isCorrect) {
        if (selectedIndex === 0) word1Btn.classList.add('incorrect');
        if (selectedIndex === 1) word2Btn.classList.add('incorrect');
        // Highlight correct word
        if (correctIndex === 0) word1Btn.classList.add('correct');
        if (correctIndex === 1) word2Btn.classList.add('correct');
    }

    // Disable buttons
    word1Btn.disabled = true;
    word2Btn.disabled = true;

    // Show next button
    nextBtn.style.display = 'inline-block';

    // Update progress bar (only for levels mode)
    if (GAME_MODE === 'levels') {
        renderLevelProgressBar();
    }
    // In free mode, nothing to update
}

// Handle next button click
function handleNextClick() {
    // Free mode: always start a new round, never ends
    if (GAME_MODE === 'free') {
        startNewRound();
        return;
    }
    // Check for game over in classic mode
    if (GAME_MODE === 'classic' && classicLives <= 0) {
        showSummaryModal();
        return;
    }
    // Continue to next round
    if (GAME_MODE === 'classic') {
        startNewRound();
    } else {
        // Levels mode
        currentRound++;
        // If finished 10 rounds, show summary
        if ((currentRound-1) % LEVELS_PER_SET === 0) {
            showSummaryModal();
        } else {
            startNewRound();
        }
    }
}

function showSummaryModal() {
    if (GAME_MODE === 'classic') {
        // Classic mode summary
        const isNewHighScore = classicScore > classicHighScore;
        if (isNewHighScore) {
            classicHighScore = classicScore;
            setClassicHighScore(classicScore);
        }
        const modalContent = summaryModal.querySelector('.modal-content');
        summaryTitle.textContent = 'Game Over!';
        summaryScore.textContent = `Your Score: ${classicScore}`;
        summaryCorrect.textContent = '';
        summaryWrong.textContent = '';
        // Clear previous custom elements
        Array.from(modalContent.querySelectorAll('.summary-extra')).forEach(e => e.remove());
        // Show high score message
        if (isNewHighScore && classicScore > 0) {
            const highScoreMsg = document.createElement('div');
            highScoreMsg.className = 'summary-extra';
            highScoreMsg.style = 'margin:18px 0 0 0;padding:12px;border-radius:10px;background:#fffbe6;color:#667eea;font-weight:bold;font-size:1.2rem;text-align:center;';
            highScoreMsg.innerHTML = '🏆 New High Score! 🏆';
            modalContent.appendChild(highScoreMsg);
        } else if (classicHighScore > 0) {
            const highScoreMsg = document.createElement('div');
            highScoreMsg.className = 'summary-extra';
            highScoreMsg.style = 'margin:12px 0 0 0;font-size:0.95rem;color:#888;text-align:center;';
            highScoreMsg.textContent = `High Score: ${classicHighScore}`;
            modalContent.appendChild(highScoreMsg);
        }
        // Replace buttons
        summaryButtons.innerHTML = '';
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Retry';
        retryBtn.style = 'margin:18px 0 0 0;padding:10px 30px;border-radius:8px;background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);color:#fff;font-weight:bold;border:none;cursor:pointer;';
        retryBtn.onclick = () => {
            console.log('Retry clicked. wordsData length:', wordsData ? wordsData.length : 'undefined');
            summaryModal.style.display = 'none';
            // Check if data is loaded
            if (!wordsData || wordsData.length === 0) {
                console.error('Retry failed: wordsData not loaded. Reloading...');
                loadWordData().then(() => {
                    if (wordsData && wordsData.length > 0) {
                        startClassicMode();
                    }
                });
            } else {
                startClassicMode();
            }
        };
        summaryButtons.appendChild(retryBtn);
    } else {
        // Levels mode summary
        const setStart = Math.floor((currentRound - 2) / LEVELS_PER_SET) * LEVELS_PER_SET;
        const setEnd = setStart + LEVELS_PER_SET;
        let correct = 0, wrong = 0;
        for (let i = setStart; i < setEnd; i++) {
            if (levelResults[i] === true) correct++;
            else if (levelResults[i] === false) wrong++;
        }
        
        // Track special patterns for this game (only if achievements enabled)
        if (ACHIEVEMENTS_ENABLED) {
            trackGamePatterns(setStart, setEnd);
        }
        
        // Update persistent score frequency (only if achievements enabled)
        if (ACHIEVEMENTS_ENABLED) {
            updateScoreFrequency(correct);
        }
        
        // Reset current game answers for next game
        currentGameAnswers = [];
        
        // Unlock achievements and show unlocked achievement if any (only if enabled)
        let newlyUnlocked = [];
        if (ACHIEVEMENTS_ENABLED) {
            newlyUnlocked = unlockAchievements();
        }
        
        // Only increment level if score >= 5
        if (correct >= 5) {
            currentLevel++;
            setCurrentLevel(currentLevel);
        }
        
        levelProgressBar.style.display = 'none';
        
        const modalContent = summaryModal.querySelector('.modal-content');
        summaryTitle.textContent = correct < 5 ? 'Level Failed' : 'Level Complete!';
        summaryScore.textContent = `Score: ${correct} / 10`;
        summaryCorrect.textContent = '';
        summaryWrong.textContent = '';
        
        // Clear previous custom elements
        Array.from(modalContent.querySelectorAll('.summary-extra')).forEach(e => e.remove());
        
        // Show achievement unlocked AFTER clearing previous elements
        if (newlyUnlocked.length > 0) {
            const achievement = newlyUnlocked[0];
            const achievementDiv = document.createElement('div');
            achievementDiv.className = 'summary-extra';
            achievementDiv.style = 'margin:18px 0 0 0;padding:12px 0;border-radius:10px;background:#fffbe6;color:#333;font-weight:bold;display:flex;align-items:center;gap:12px;justify-content:center;';
            achievementDiv.innerHTML = `<span style='font-size:1.6rem;'>${achievement.icon}</span> <span>Achievement Unlocked: ${achievement.name}</span>`;
            modalContent.appendChild(achievementDiv);
        }

        // Add score too low message if failed
        if (correct < 5) {
            const failMsg = document.createElement('div');
            failMsg.className = 'summary-extra';
            failMsg.style = 'margin:10px 0 0 0;font-size:1.1rem;color:#b71c1c;font-weight:bold;text-align:center;';
            failMsg.textContent = 'Score too low. Try again!';
            modalContent.appendChild(failMsg);
        }

        // Add circles for each question (correct/wrong)
        const circlesDiv = document.createElement('div');
        circlesDiv.className = 'summary-extra';
        circlesDiv.style = 'display:flex;justify-content:center;gap:6px;margin:12px 0 0 0;';
        for (let i = setStart; i < setEnd; i++) {
            const circle = document.createElement('div');
        circle.style = 'width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.08);border:2px solid #bbb;';
        if (levelResults[i] === true) {
            circle.style.background = '#43e97b';
            circle.style.borderColor = '#43e97b';
            circle.innerHTML = `<span style='color:white;font-size:1.1rem;'>&#10003;</span>`;
        } else if (levelResults[i] === false) {
            circle.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
            circle.style.borderColor = '#fa709a';
            circle.innerHTML = `<span style='color:white;font-size:1.1rem;'>&#10007;</span>`;
        } else {
            circle.style.background = 'transparent';
            circle.innerHTML = '';
        }
        circlesDiv.appendChild(circle);
        }
        // Insert circlesDiv after summaryScore
        if (summaryScore && summaryScore.parentNode) {
            summaryScore.parentNode.insertBefore(circlesDiv, summaryScore.nextSibling);
        } else {
            modalContent.appendChild(circlesDiv);
        }

        // Restore default buttons for levels mode
        summaryButtons.innerHTML = '';
        // Add Retry button if failed
        if (correct < 5) {
            const retryBtn = document.createElement('button');
            retryBtn.textContent = 'Retry';
            retryBtn.style = 'margin-top:16px;padding:10px 30px;border-radius:8px;background:#b71c1c;color:#fff;font-weight:bold;border:none;cursor:pointer;font-size:1.1rem;';
            retryBtn.onclick = function() {
                console.log('Levels retry clicked. wordsData length:', wordsData ? wordsData.length : 'undefined');
                summaryModal.style.display = 'none';
                levelProgressBar.style.display = '';
                currentRound = (currentLevel - 1) * LEVELS_PER_SET + 1;
                // Check if data is loaded
                if (!wordsData || wordsData.length === 0) {
                    console.error('Retry failed: wordsData not loaded. Reloading...');
                    loadWordData().then(() => {
                        if (wordsData && wordsData.length > 0) {
                            startNewRound();
                        }
                    });
                } else {
                    startNewRound();
                }
            };
            summaryButtons.appendChild(retryBtn);
        }
        // Only add Next button if passed (correct >= 5)
        if (correct >= 5) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Next';
            nextBtn.style = 'margin-top:16px;padding:10px 30px;border-radius:8px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;font-weight:bold;border:none;cursor:pointer;font-size:1.1rem;';
            nextBtn.onclick = function() {
                console.log('Levels next clicked. wordsData length:', wordsData ? wordsData.length : 'undefined');
                summaryModal.style.display = 'none';
                levelProgressBar.style.display = '';
                // Check if data is loaded
                if (!wordsData || wordsData.length === 0) {
                    console.error('Next failed: wordsData not loaded. Reloading...');
                    loadWordData().then(() => {
                        if (wordsData && wordsData.length > 0) {
                            startNewRound();
                        }
                    });
                } else {
                    startNewRound();
                }
            };
            summaryButtons.appendChild(nextBtn);
        }
    }
    
    // Show modal
    summaryModal.style.display = 'flex';
}

// Event Listeners - Mode Selection
levelsBtn.addEventListener('click', startLevelsMode);
classicBtn.addEventListener('click', startClassicMode);
if (freeBtn) freeBtn.addEventListener('click', startFreeMode);
homeBtn.addEventListener('click', goHome);

// Event Listeners - Sound Toggle
const soundBtn = document.getElementById('soundBtn');
const soundBtnHome = document.getElementById('soundBtnHome');
if (soundBtn) {
    soundBtn.addEventListener('click', toggleSound);
}
if (soundBtnHome) {
    soundBtnHome.addEventListener('click', toggleSound);
}

// Event Listeners - Game
word1Btn.addEventListener('click', () => handleWordClick(0));
word2Btn.addEventListener('click', () => handleWordClick(1));
nextBtn.addEventListener('click', handleNextClick);

// Info Modal Logic
const infoBtn = document.getElementById('infoBtn');
const infoBtn2 = document.getElementById('infoBtn2');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const wordTableBody = document.querySelector('#wordTable tbody');

// Function to open info modal and populate table
function openInfoModal() {

    if (infoModal) {
        infoModal.style.display = 'flex';
        if (wordTableBody && wordsData.length > 0 && wordTableBody.childElementCount === 0) {
            // Fill table with first 200 words
            let rows = '';
            for (let i = 0; i < Math.min(200, wordsData.length); i++) {
                rows += `<tr><td>${wordsData[i].rank}</td><td>${toTitleCase(wordsData[i].lemma)}</td></tr>`;
            }
            wordTableBody.innerHTML = rows;
        }
    }
}

if (infoBtn) {
    infoBtn.addEventListener('click', openInfoModal);
}

if (infoBtn2) {
    infoBtn2.addEventListener('click', openInfoModal);
}

if (closeModal) {
    closeModal.addEventListener('click', function() {
        if (infoModal) {
            infoModal.style.display = 'none';
        }
    });
}

// Achievements modal logic (conditional based on ACHIEVEMENTS_ENABLED)
if (ACHIEVEMENTS_ENABLED) {
    const trophyBtn = document.getElementById('trophyBtn');
    const achievementsModal = document.getElementById('achievementsModal');
    const closeAchievements = document.getElementById('closeAchievements');

    if (trophyBtn) {
        trophyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (achievementsModal) {
                achievementsModal.style.display = 'flex';
                renderAchievementsBoard();
            }
        });
    }

    if (closeAchievements) {
        closeAchievements.addEventListener('click', function() {
            if (achievementsModal) {
                achievementsModal.style.display = 'none';
            }
        });
    }
} else {
    // Hide trophy button when achievements are disabled
    const trophyBtn = document.getElementById('trophyBtn');
    if (trophyBtn) {
        trophyBtn.style.display = 'none';
    }
}

window.addEventListener('click', function(e) {
    if (infoModal && e.target === infoModal) {
        infoModal.style.display = 'none';
    }
    if (ACHIEVEMENTS_ENABLED) {
        const achievementsModal = document.getElementById('achievementsModal');
        if (achievementsModal && e.target === achievementsModal) {
            achievementsModal.style.display = 'none';
        }
    }
});

// Load word data on startup
loadWordData();

// Load sound preference on startup
loadSoundPreference();
