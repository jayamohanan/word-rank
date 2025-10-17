// ============================================
// ACHIEVEMENTS TOGGLE
// Set to true to enable achievements, false to disable
// ============================================
const ACHIEVEMENTS_ENABLED = false;

// Persistent level tracker
function getCurrentLevel() {
    return parseInt(localStorage.getItem('currentLevel') || '1', 10);
}
function setCurrentLevel(level) {
    localStorage.setItem('currentLevel', level);
}

// Level Progress Bar State
const LEVELS_PER_SET = 10;
let wordsData = [];
let currentLevel = getCurrentLevel();
let currentRound = (currentLevel - 1) * LEVELS_PER_SET + 1;
let currentWords = [];
let isAnswered = false;
let levelResults = []; // true for correct, false for incorrect


// DOM Elements
const word1Btn = document.getElementById('word1');
const word2Btn = document.getElementById('word2');
const word3Btn = document.getElementById('word3');
const feedbackDiv = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const roundNumber = document.getElementById('roundNumber');
const levelProgressBar = document.getElementById('levelProgressBar');
const summaryModal = document.getElementById('summaryModal');
const summaryScore = document.getElementById('summaryScore');
const summaryCorrect = document.getElementById('summaryCorrect');
const summaryWrong = document.getElementById('summaryWrong');
const summaryCloseBtn = document.getElementById('summaryCloseBtn');

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

// Get three random words
function getRandomWords() {
    const shuffled = [...wordsData].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1], shuffled[2]];
}

// Helper function to convert to Title Case
function toTitleCase(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Render the level progress bar for the current set
function renderLevelProgressBar() {
    if (!levelProgressBar) return;
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
    // Update level number in UI
    const levelNumberDiv = document.getElementById('levelNumber');
    if (levelNumberDiv) levelNumberDiv.textContent = `Level ${currentLevel}`;
    // Reset state
    isAnswered = false;
    currentWords = getRandomWords();
    
    // Reset game answers if starting first round of level
    if ((currentRound - 1) % LEVELS_PER_SET === 0) {
        currentGameAnswers = [];
    }

    // Update UI
    word1Btn.querySelector('.word-text').textContent = toTitleCase(currentWords[0].lemma);
    word2Btn.querySelector('.word-text').textContent = toTitleCase(currentWords[1].lemma);
    word3Btn.querySelector('.word-text').textContent = toTitleCase(currentWords[2].lemma);

    // Reset styles
    word1Btn.className = 'word-tile';
    word2Btn.className = 'word-tile';
    word3Btn.className = 'word-tile';
    word1Btn.disabled = false;
    word2Btn.disabled = false;
    word3Btn.disabled = false;

    // Clear feedback
    feedbackDiv.textContent = '';
    feedbackDiv.className = 'feedback';

    // Clear icons
    for (let i = 1; i <= 3; i++) {
        document.getElementById('icon' + i).innerHTML = '';
    }

    // Hide next button
    nextBtn.style.display = 'none';


    // Update level progress bar
    renderLevelProgressBar();
}

// Handle word selection
function handleWordClick(selectedIndex) {
    if (isAnswered) return;

    isAnswered = true;

    // Determine which word is most popular (lowest rank)
    const selectedWord = currentWords[selectedIndex];
    const correctIndex = currentWords.reduce((minIdx, word, idx, arr) => word.rank < arr[minIdx].rank ? idx : minIdx, 0);
    const isCorrect = selectedIndex === correctIndex;

    // Track result for progress bar
    levelResults[currentRound - 1] = isCorrect;
    
    // Track answer in current game
    currentGameAnswers.push(isCorrect);
    
    // Update total correct count
    if (isCorrect) {
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

    // Update UI based on result
    if (isCorrect) {
        feedbackDiv.innerHTML = '\u2713 Correct!';
        feedbackDiv.className = 'feedback correct';
    } else {
        feedbackDiv.innerHTML = '\u2717 Wrong!';
        feedbackDiv.className = 'feedback incorrect';
    }
    // Show ranks at bottom in requested horizontal format
    feedbackDiv.innerHTML += rankHtml;

    if (selectedIndex === 0) word1Btn.classList.add('correct');
    if (selectedIndex === 1) word2Btn.classList.add('correct');
    if (selectedIndex === 2) word3Btn.classList.add('correct');
    if (!isCorrect) {
        if (selectedIndex === 0) word1Btn.classList.add('incorrect');
        if (selectedIndex === 1) word2Btn.classList.add('incorrect');
        if (selectedIndex === 2) word3Btn.classList.add('incorrect');
        // Highlight correct word
        if (correctIndex === 0) word1Btn.classList.add('correct');
        if (correctIndex === 1) word2Btn.classList.add('correct');
        if (correctIndex === 2) word3Btn.classList.add('correct');
    }

    // Disable buttons
    word1Btn.disabled = true;
    word2Btn.disabled = true;
    word3Btn.disabled = true;

    // Show next button
    nextBtn.style.display = 'inline-block';

    // Update progress bar
    renderLevelProgressBar();
}

// Handle next button click
function handleNextClick() {
    currentRound++;
    // If finished 10 rounds, show summary
    if ((currentRound-1) % LEVELS_PER_SET === 0) {
        showSummaryModal();
    } else {
        startNewRound();
    }
}

function showSummaryModal() {
    // Calculate score
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
    // Hide game area
    document.getElementById('gameArea').style.display = 'none';
    levelProgressBar.style.display = 'none';
    const modalContent = summaryModal.querySelector('.modal-content');
    // Clear previous modal content except static elements
    const title = modalContent.querySelector('h2');
    if (title) title.textContent = correct < 5 ? 'Level Failed' : 'Level Complete!';
    summaryScore.textContent = `Score: ${correct} / 10`;
    summaryCorrect.textContent = '';
    summaryWrong.textContent = '';
    // Remove any previous custom elements (failMsg, retryBtn, achievementDiv, circles)
    Array.from(modalContent.querySelectorAll('.summary-extra')).forEach(e => e.remove());
    
    // Show achievement unlocked AFTER clearing previous elements
    if (newlyUnlocked.length > 0) {
        const achievement = newlyUnlocked[0]; // We return only highest priority, so take first
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'summary-extra'; // Add class so it gets cleaned up next time
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

    // Add circles for each question (correct/wrong) BELOW the score label
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

    // Add Retry button if failed
    if (correct < 5) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'summary-extra';
        retryBtn.textContent = 'Retry';
        retryBtn.style = 'margin-top:16px;padding:10px 30px;border-radius:8px;background:#b71c1c;color:#fff;font-weight:bold;border:none;cursor:pointer;font-size:1.1rem;';
        retryBtn.onclick = function() {
            summaryModal.style.display = 'none';
            document.getElementById('gameArea').style.display = '';
            levelProgressBar.style.display = '';
            currentRound = (currentLevel - 1) * LEVELS_PER_SET + 1;
            startNewRound();
        };
        modalContent.appendChild(retryBtn);
    } else {
        // Add Next button if level completed
        const nextBtn = document.createElement('button');
        nextBtn.className = 'summary-extra';
        nextBtn.textContent = 'Next';
        nextBtn.style = 'margin-top:16px;padding:10px 30px;border-radius:8px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;font-weight:bold;border:none;cursor:pointer;font-size:1.1rem;';
        nextBtn.onclick = function() {
            summaryModal.style.display = 'none';
            document.getElementById('gameArea').style.display = '';
            levelProgressBar.style.display = '';
            // Start next level from beginning
            currentRound = (currentLevel - 1) * LEVELS_PER_SET + 1;
            startNewRound();
        };
        modalContent.appendChild(nextBtn);
    }

    // Remove the close button if present
    const closeBtn = modalContent.querySelector('#summaryCloseBtn');
    if (closeBtn) closeBtn.style.display = 'none';

    summaryModal.style.display = 'flex';
}

if (summaryCloseBtn) {
    console.log('jaya');
    summaryCloseBtn.onclick = function() {
        summaryModal.style.display = 'none';
        // Optionally reset for next set
        document.getElementById('gameArea').style.display = '';
        levelProgressBar.style.display = '';
        // Start next level from beginning
        currentRound = (currentLevel - 1) * LEVELS_PER_SET + 1;
        startNewRound();
    };
}
else{
    console.log('no jaya');
}

// Event Listeners
word1Btn.addEventListener('click', () => handleWordClick(0));
word2Btn.addEventListener('click', () => handleWordClick(1));
word3Btn.addEventListener('click', () => handleWordClick(2));
nextBtn.addEventListener('click', handleNextClick);

// Info Modal Logic
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.getElementById('closeModal');
const wordTableBody = document.querySelector('#wordTable tbody');

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

if (infoBtn) {
    infoBtn.addEventListener('click', function() {
        infoModal.style.display = 'flex';
        if (wordTableBody && wordsData.length > 0 && wordTableBody.childElementCount === 0) {
            // Fill table with first 200 words
            let rows = '';
            for (let i = 0; i < Math.min(200, wordsData.length); i++) {
                rows += `<tr><td>${wordsData[i].rank}</td><td>${toTitleCase(wordsData[i].lemma)}</td></tr>`;
            }
            wordTableBody.innerHTML = rows;
        }
    });
}

if (closeModal) {
    closeModal.addEventListener('click', function() {
        infoModal.style.display = 'none';
    });
}

window.addEventListener('click', function(e) {
    if (e.target === infoModal) {
        infoModal.style.display = 'none';
    }
    if (e.target === achievementsModal) {
        achievementsModal.style.display = 'none';
    }
});

// Start the game
// Start the game
initGame();
