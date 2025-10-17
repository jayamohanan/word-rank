// Persistent level tracker
function getCurrentLevel() {
    return parseInt(localStorage.getItem('currentLevel') || '1', 10);
}
function setCurrentLevel(level) {
    localStorage.setItem('currentLevel', level);
}
// Achievements definitions
// Level Progress Bar State
const LEVELS_PER_SET = 10;
const ACHIEVEMENTS = [
  // Beginner achievements
  { id: 'first_steps', name: 'First Steps', desc: 'Complete your very first game', icon: '🎮', priority: 1,
    check: s => s.totalGames >= 1 },
  { id: 'novice_linguist', name: 'Novice Linguist', desc: 'Answer your first 10 questions correctly', icon: '📚', priority: 2,
    check: s => s.totalCorrect >= 10 },
  { id: 'on_a_roll', name: 'On a Roll', desc: 'Get a score of 6/10 or higher for the first time', icon: '🎯', priority: 3,
    check: s => s.scores6Plus >= 1 },
  { id: 'solid_performance', name: 'Solid Performance', desc: 'Get a score of 8/10 or higher for the first time', icon: '⭐', priority: 4,
    check: s => s.scores8Plus >= 1 },
  { id: 'flawless_victory', name: 'Flawless Victory', desc: 'Achieve a perfect 10/10 score for the first time', icon: '💎', priority: 5,
    check: s => s.scoreFreq[10] >= 1 },
  { id: 'taste_of_success', name: 'Taste of Success', desc: 'Achieve a score of 9/10 or higher for the first time', icon: '🌟', priority: 6,
    check: s => s.scores9Plus >= 1 },
  { id: 'getting_the_hang', name: 'Getting the Hang of It', desc: 'Complete 5 total games', icon: '🎓', priority: 7,
    check: s => s.totalGames >= 5 },
  { id: 'word_dabbler', name: 'Word Dabbler', desc: 'Complete 10 total games', icon: '📖', priority: 8,
    check: s => s.totalGames >= 10 },
  { id: 'above_average', name: 'Above Average', desc: 'Achieve a total of 25 correct answers', icon: '📈', priority: 9,
    check: s => s.totalCorrect >= 25 },
  { id: 'building_momentum', name: 'Building Momentum', desc: 'Achieve a total of 50 correct answers', icon: '🚀', priority: 10,
    check: s => s.totalCorrect >= 50 },
  { id: 'streak_starter', name: 'Streak Starter', desc: 'Get 5 correct answers in a row', icon: '🔥', priority: 11,
    check: s => s.maxStreak >= 5 },
  { id: 'consistent_beginner', name: 'Consistent Beginner', desc: 'Achieve a score of 5/10 or higher in 3 consecutive games', icon: '📊', priority: 12,
    check: s => s.consecutiveStreak5Plus >= 3 },
  { id: 'quick_learner', name: 'Quick Learner', desc: 'Achieve a score of 7/10 within your first 5 games played', icon: '🧠', priority: 13,
    check: s => s.totalGames <= 5 && s.scoreFreq[7] + s.scoreFreq[8] + s.scoreFreq[9] + s.scoreFreq[10] >= 1 },
  { id: 'momentum_builder', name: 'Momentum Builder', desc: 'Get the first 5 questions of a game correct', icon: '🎬', priority: 14,
    check: s => s.first5Correct >= 1 },
  { id: 'strong_finish', name: 'Strong Finish', desc: 'Get the last 5 questions of a game correct', icon: '�', priority: 15,
    check: s => s.last5Correct >= 1 },
  
  // Intermediate achievements
  { id: 'persistent_learner', name: 'Persistent Learner', desc: 'Complete 15 total games', icon: '💪', priority: 16,
    check: s => s.totalGames >= 15 },
  { id: 'dedicated', name: 'Dedicated', desc: 'Complete 25 total games', icon: '🎖️', priority: 17,
    check: s => s.totalGames >= 25 },
  { id: 'word_enthusiast', name: 'Word Enthusiast', desc: 'Complete 50 total games', icon: '📚', priority: 18,
    check: s => s.totalGames >= 50 },
  { id: 'century_of_correct', name: 'Century of Correct', desc: 'Answer 100 total questions correctly', icon: '💯', priority: 19,
    check: s => s.totalCorrect >= 100 },
  { id: 'quarter_grand', name: 'A Quarter Grand', desc: 'Answer 250 total questions correctly', icon: '🎯', priority: 20,
    check: s => s.totalCorrect >= 250 },
  { id: 'skilled_player', name: 'Skilled Player', desc: 'Achieve 5 total scores of 8/10 or higher', icon: '⚡', priority: 21,
    check: s => s.scores8Plus >= 5 },
  { id: 'highly_proficient', name: 'Highly Proficient', desc: 'Achieve 10 total scores of 8/10 or higher', icon: '🌟', priority: 22,
    check: s => s.scores8Plus >= 10 },
  { id: 'excellence', name: 'Excellence', desc: 'Achieve 25 total scores of 8/10 or higher', icon: '✨', priority: 23,
    check: s => s.scores8Plus >= 25 },
  { id: 'perfectionist', name: 'Perfectionist', desc: 'Achieve 3 total perfect 10/10 scores', icon: '💎', priority: 24,
    check: s => s.scoreFreq[10] >= 3 },
  { id: 'masterful', name: 'Masterful', desc: 'Achieve 5 total perfect 10/10 scores', icon: '👑', priority: 25,
    check: s => s.scoreFreq[10] >= 5 },
  { id: 'virtuoso', name: 'Virtuoso', desc: 'Achieve 10 total perfect 10/10 scores', icon: '🏆', priority: 26,
    check: s => s.scoreFreq[10] >= 10 },
  { id: 'reliable', name: 'Reliable', desc: 'Achieve a score of 7/10 or higher in 5 consecutive games', icon: '�', priority: 27,
    check: s => s.consecutiveStreak7Plus >= 5 },
  { id: 'unstoppable', name: 'Unstoppable', desc: 'Achieve a score of 8/10 or higher in 5 consecutive games', icon: '🔥', priority: 28,
    check: s => s.consecutiveStreak8Plus >= 5 },
  { id: 'steady_climb', name: 'Steady Climb', desc: 'Have 5 consecutive games where your score does not decrease', icon: '📈', priority: 29,
    check: s => s.consecutiveNonDecreasing >= 5 },
  { id: 'the_trifecta', name: 'The Trifecta', desc: 'Achieve a 10/10, followed by a 9/10, followed by a 10/10', icon: '🎪', priority: 30,
    check: s => s.trifecta >= 1 },
  { id: 'solid_foundation', name: 'Solid Foundation', desc: 'Answer the first question correctly in 20 different games', icon: '🏗️', priority: 31,
    check: s => s.firstQuestionCorrect >= 20 },
  { id: 'clutch_player', name: 'Clutch Player', desc: 'Answer the final question correctly in 20 different games', icon: '🎯', priority: 32,
    check: s => s.lastQuestionCorrect >= 20 },
  { id: 'daily_grind', name: 'Daily Grind', desc: 'Play for 5 consecutive days', icon: '📅', priority: 33,
    check: s => s.consecutiveDays >= 5 },
  { id: 'week_long_warrior', name: 'Week-Long Warrior', desc: 'Play for 7 consecutive days', icon: '🗓️', priority: 34,
    check: s => s.consecutiveDays >= 7 },
  { id: 'marathon_runner', name: 'Marathon Runner', desc: 'Play 10 games in a single day', icon: '🏃', priority: 35,
    check: s => s.maxGamesInDay >= 10 },
  
  // Advanced achievements
  { id: 'vocabulary_veteran', name: 'Vocabulary Veteran', desc: 'Complete 100 total games', icon: '🎓', priority: 36,
    check: s => s.totalGames >= 100 },
  { id: 'word_sage', name: 'Word Sage', desc: 'Complete 250 total games', icon: '🧙', priority: 37,
    check: s => s.totalGames >= 250 },
  { id: 'half_thousand', name: 'Half a Thousand', desc: 'Answer 500 total questions correctly', icon: '🎯', priority: 38,
    check: s => s.totalCorrect >= 500 },
  { id: 'master_of_words', name: 'Master of Words', desc: 'Answer 1,000 total questions correctly', icon: '📜', priority: 39,
    check: s => s.totalCorrect >= 1000 },
  { id: 'milestone', name: 'Milestone', desc: 'Reach a total score sum of 500 points', icon: '🎖️', priority: 40,
    check: s => s.totalScoreSum >= 500 },
  { id: 'grand_master', name: 'Grand Master', desc: 'Achieve 50 total scores of 8/10 or higher', icon: '👑', priority: 41,
    check: s => s.scores8Plus >= 50 },
  { id: 'rising_excellence', name: 'Rising Excellence', desc: 'Achieve 75 total scores of 8/10 or higher', icon: '⭐', priority: 42,
    check: s => s.scores8Plus >= 75 },
  { id: 'beyond_perfect', name: 'Beyond Perfect', desc: 'Achieve 25 total perfect 10/10 scores', icon: '💎', priority: 43,
    check: s => s.scoreFreq[10] >= 25 },
  { id: 'legendary_skill', name: 'Legendary Skill', desc: 'Achieve 50 total perfect 10/10 scores', icon: '🌟', priority: 44,
    check: s => s.scoreFreq[10] >= 50 },
  { id: 'steady_hand', name: 'Steady Hand', desc: 'Maintain an average score of 7.0 or higher over 50 games', icon: '🎯', priority: 45,
    check: s => s.totalGames >= 50 && (s.totalScoreSum / s.totalGames) >= 7.0 },
  { id: 'sharp_mind', name: 'Sharp Mind', desc: 'Maintain an average score of 8.0 or higher over 50 games', icon: '🧠', priority: 46,
    check: s => s.totalGames >= 50 && (s.totalScoreSum / s.totalGames) >= 8.0 },
  { id: 'model_of_consistency', name: 'Model of Consistency', desc: 'Achieve 10 consecutive games with a score of 7/10 or higher', icon: '📊', priority: 47,
    check: s => s.consecutiveStreak7Plus >= 10 },
  { id: 'pinnacle_of_consistency', name: 'Pinnacle of Consistency', desc: 'Achieve 15 consecutive games with a score of 7/10 or higher', icon: '🏔️', priority: 48,
    check: s => s.consecutiveStreak7Plus >= 15 },
  { id: 'the_standard', name: 'The Standard', desc: 'Achieve 20 consecutive games with a score of 7/10 or higher', icon: '🎖️', priority: 49,
    check: s => s.consecutiveStreak7Plus >= 20 },
  { id: 'consistency_cascade', name: 'Consistency Cascade', desc: 'Achieve a 10-game streak of 9/10 or higher', icon: '💫', priority: 50,
    check: s => s.consecutiveStreak9Plus >= 10 },
  { id: 'seven_club', name: 'The 7-Club Member', desc: 'Score exactly 7/10, 5 times', icon: '7️⃣', priority: 51,
    check: s => s.scoreFreq[7] >= 5 },
  { id: 'eight_club', name: 'The 8-Club Member', desc: 'Score exactly 8/10, 5 times', icon: '8️⃣', priority: 52,
    check: s => s.scoreFreq[8] >= 5 },
  { id: 'nine_club', name: 'The 9-Club Member', desc: 'Score exactly 9/10, 5 times', icon: '9️⃣', priority: 53,
    check: s => s.scoreFreq[9] >= 5 },
  { id: 'habit_former', name: 'Habit Former', desc: 'Play for 30 consecutive days', icon: '📆', priority: 54,
    check: s => s.consecutiveDays >= 30 },
  { id: 'iron_will', name: 'Iron Will', desc: 'Play 20 games in a single week', icon: '💪', priority: 55,
    check: s => s.maxGamesInWeek >= 20 },
  { id: 'perfectionist_path', name: "The Perfectionist's Path", desc: 'Achieve 5 perfect scores in a single calendar week', icon: '🌟', priority: 56,
    check: s => s.maxPerfectsInWeek >= 5 },
  
  // Expert achievements
  { id: 'living_dictionary', name: 'Living Dictionary', desc: 'Complete 500 total games', icon: '📕', priority: 57,
    check: s => s.totalGames >= 500 },
  { id: 'word_guru', name: 'Word Guru', desc: 'Answer 2,500 total questions correctly', icon: '🧘', priority: 58,
    check: s => s.totalCorrect >= 2500 },
  { id: 'high_scorer', name: 'High Scorer', desc: 'Reach a total score sum of 2,500 points', icon: '🎯', priority: 59,
    check: s => s.totalScoreSum >= 2500 },
  { id: 'lifetime_learner', name: 'Lifetime Learner', desc: 'Play for 100 total days', icon: '📚', priority: 60,
    check: s => s.totalDaysPlayed >= 100 },
  { id: 'consistency_incarnate', name: 'Consistency Incarnate', desc: 'Achieve 100 total scores of 8/10 or higher', icon: '✨', priority: 61,
    check: s => s.scores8Plus >= 100 },
  { id: 'perfection_incarnate', name: 'Perfection Incarnate', desc: 'Achieve 100 total perfect 10/10 scores', icon: '�', priority: 62,
    check: s => s.scoreFreq[10] >= 100 },
  { id: 'hundred_club', name: 'The 100-Club', desc: 'Achieve a total of 100 games with a score of 9/10 or higher', icon: '💯', priority: 63,
    check: s => s.scores9Plus >= 100 },
  { id: 'scholar', name: 'Scholar', desc: 'Maintain an average score of 8.0 or higher over 100 games', icon: '🎓', priority: 64,
    check: s => s.totalGames >= 100 && (s.totalScoreSum / s.totalGames) >= 8.0 },
  { id: 'unparalleled', name: 'Unparalleled', desc: 'Maintain an average score of 9.0 or higher over 50 games', icon: '🌟', priority: 65,
    check: s => s.totalGames >= 50 && (s.totalScoreSum / s.totalGames) >= 9.0 },
  { id: 'unbreakable', name: 'Unbreakable', desc: 'Achieve 25 consecutive games with a score of 8/10 or higher', icon: '🛡️', priority: 66,
    check: s => s.consecutiveStreak8Plus >= 25 },
  { id: 'untouchable', name: 'Untouchable', desc: 'Achieve 10 consecutive games with a score of 9/10 or higher', icon: '⚡', priority: 67,
    check: s => s.consecutiveStreak9Plus >= 10 },
  { id: 'grand_scholar', name: 'Grand Scholar', desc: 'Maintain an average score of 9.0 or higher over 100 games', icon: '🏛️', priority: 68,
    check: s => s.totalGames >= 100 && (s.totalScoreSum / s.totalGames) >= 9.0 },
  { id: 'hot_streak', name: 'Hot Streak', desc: 'Answer 10 questions correctly in a row', icon: '🔥', priority: 69,
    check: s => s.maxStreak >= 10 },
  { id: 'bookends', name: 'Bookends', desc: 'Get the first and last question of a game correct in 10 separate games', icon: '📖', priority: 70,
    check: s => s.bookends >= 10 },
  { id: 'peak_performance', name: 'Peak Performance', desc: 'Beat your personal best score twice in a single day', icon: '⛰️', priority: 71,
    check: s => s.beatPersonalBestTwiceInDay >= 1 },
  
  // Legendary achievements
  { id: 'life_in_words', name: 'A Life in Words', desc: 'Complete 1,000 total games', icon: '📚', priority: 72,
    check: s => s.totalGames >= 1000 },
  { id: 'lexicon_legend', name: 'Lexicon Legend', desc: 'Answer 5,000 total questions correctly', icon: '📜', priority: 73,
    check: s => s.totalCorrect >= 5000 },
  { id: 'ultimate_word_master', name: 'Ultimate Word Master', desc: 'Achieve a total of 150 games with a score of 9/10 or higher', icon: '👑', priority: 74,
    check: s => s.scores9Plus >= 150 },
  { id: 'absolute_perfection', name: 'Absolute Perfection', desc: 'Achieve 30 consecutive games with a score of 8/10 or higher', icon: '�', priority: 75,
    check: s => s.consecutiveStreak8Plus >= 30 },
  { id: 'perfect_hundred', name: 'The Perfect Hundred', desc: 'Achieve 150 total perfect 10/10 scores', icon: '🌟', priority: 76,
    check: s => s.scoreFreq[10] >= 150 },
];

// Get comprehensive statistics for achievement checking
function getStats() {
    const scoreFreq = JSON.parse(localStorage.getItem('scoreFrequency') || '{}');
    for (let i = 0; i <= 10; i++) {
        if (typeof scoreFreq[i] !== 'number') scoreFreq[i] = 0;
    }
    
    const stats = {
        scoreFreq: scoreFreq,
        totalGames: parseInt(localStorage.getItem('totalGames') || '0'),
        totalCorrect: parseInt(localStorage.getItem('totalCorrect') || '0'),
        totalScoreSum: parseInt(localStorage.getItem('totalScoreSum') || '0'),
        maxStreak: parseInt(localStorage.getItem('maxStreak') || '0'),
        
        // Score-based counts
        scores6Plus: scoreFreq[6] + scoreFreq[7] + scoreFreq[8] + scoreFreq[9] + scoreFreq[10],
        scores7Plus: scoreFreq[7] + scoreFreq[8] + scoreFreq[9] + scoreFreq[10],
        scores8Plus: scoreFreq[8] + scoreFreq[9] + scoreFreq[10],
        scores9Plus: scoreFreq[9] + scoreFreq[10],
        
        // Consecutive game streaks
        consecutiveStreak5Plus: parseInt(localStorage.getItem('consecutiveStreak5Plus') || '0'),
        consecutiveStreak7Plus: parseInt(localStorage.getItem('consecutiveStreak7Plus') || '0'),
        consecutiveStreak8Plus: parseInt(localStorage.getItem('consecutiveStreak8Plus') || '0'),
        consecutiveStreak9Plus: parseInt(localStorage.getItem('consecutiveStreak9Plus') || '0'),
        consecutiveNonDecreasing: parseInt(localStorage.getItem('consecutiveNonDecreasing') || '0'),
        
        // Question position tracking
        first5Correct: parseInt(localStorage.getItem('first5Correct') || '0'),
        last5Correct: parseInt(localStorage.getItem('last5Correct') || '0'),
        firstQuestionCorrect: parseInt(localStorage.getItem('firstQuestionCorrect') || '0'),
        lastQuestionCorrect: parseInt(localStorage.getItem('lastQuestionCorrect') || '0'),
        bookends: parseInt(localStorage.getItem('bookends') || '0'),
        
        // Special patterns
        trifecta: parseInt(localStorage.getItem('trifecta') || '0'),
        
        // Daily tracking
        consecutiveDays: parseInt(localStorage.getItem('consecutiveDays') || '0'),
        totalDaysPlayed: parseInt(localStorage.getItem('totalDaysPlayed') || '0'),
        maxGamesInDay: parseInt(localStorage.getItem('maxGamesInDay') || '0'),
        maxGamesInWeek: parseInt(localStorage.getItem('maxGamesInWeek') || '0'),
        maxPerfectsInWeek: parseInt(localStorage.getItem('maxPerfectsInWeek') || '0'),
        beatPersonalBestTwiceInDay: parseInt(localStorage.getItem('beatPersonalBestTwiceInDay') || '0'),
    };
    
    return stats;
}

function unlockAchievements() {
    const stats = getStats();
    let unlocked = JSON.parse(localStorage.getItem('achievementsUnlocked') || '{}');
    let newlyUnlocked = [];
    
    ACHIEVEMENTS.forEach(a => {
        if (a.check(stats) && !unlocked[a.id]) {
            unlocked[a.id] = true;
            newlyUnlocked.push(a);
        }
    });
    
    localStorage.setItem('achievementsUnlocked', JSON.stringify(unlocked));
    
    // Return only the highest priority achievement if multiple unlocked
    if (newlyUnlocked.length > 0) {
        newlyUnlocked.sort((a, b) => b.priority - a.priority);
        return [newlyUnlocked[0]];
    }
    return [];
}

function renderAchievementsBoard() {
    const stats = getStats();
    const unlocked = JSON.parse(localStorage.getItem('achievementsUnlocked') || '{}');
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = '';
    
    ACHIEVEMENTS.forEach(a => {
        const div = document.createElement('div');
        div.className = 'achievement' + (unlocked[a.id] ? ' unlocked' : '');
        div.innerHTML = `
            <span class="achievement-icon">${a.icon}</span>
            <span class="achievement-text">
                <span class="achievement-name">${a.name}</span>
                <span class="achievement-desc">${a.desc}</span>
            </span>
            <span class="achievement-progress">
                ${unlocked[a.id]
                    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#43e97b" viewBox="0 0 16 16"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2M3 8a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z"/></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fa709a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}
            </span>
        `;
        list.appendChild(div);
    });
}

// Track streaks (within questions)
let currentStreak = 0;
let currentGameAnswers = []; // Track answers in current game

function updateStreak(isCorrect) {
    if (isCorrect) {
        currentStreak++;
        let maxStreak = parseInt(localStorage.getItem('maxStreak') || '0', 10);
        if (currentStreak > maxStreak) {
            localStorage.setItem('maxStreak', currentStreak);
        }
    } else {
        currentStreak = 0;
    }
}

// Update daily tracking
function updateDailyTracking() {
    const today = new Date().toDateString();
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    const todayGames = parseInt(localStorage.getItem('todayGames') || '0');
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (lastPlayedDate !== today) {
        // New day
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const consecutiveDays = parseInt(localStorage.getItem('consecutiveDays') || '0');
        
        if (lastPlayedDate === yesterday) {
            localStorage.setItem('consecutiveDays', consecutiveDays + 1);
        } else if (lastPlayedDate) {
            localStorage.setItem('consecutiveDays', '1');
        } else {
            localStorage.setItem('consecutiveDays', '1');
        }
        
        localStorage.setItem('lastPlayedDate', today);
        localStorage.setItem('todayGames', '1');
        
        // Track total days played
        const totalDaysPlayed = parseInt(localStorage.getItem('totalDaysPlayed') || '0');
        localStorage.setItem('totalDaysPlayed', totalDaysPlayed + 1);
        
        // Update max games in day
        const maxGamesInDay = parseInt(localStorage.getItem('maxGamesInDay') || '0');
        if (todayGames > maxGamesInDay) {
            localStorage.setItem('maxGamesInDay', todayGames);
        }
    } else {
        localStorage.setItem('todayGames', todayGames + 1);
        const maxGamesInDay = parseInt(localStorage.getItem('maxGamesInDay') || '0');
        if (todayGames + 1 > maxGamesInDay) {
            localStorage.setItem('maxGamesInDay', todayGames + 1);
        }
    }
}

// Update weekly tracking
function updateWeeklyTracking(score) {
    const currentWeek = getWeekNumber(new Date());
    const lastWeek = localStorage.getItem('lastWeek');
    
    if (lastWeek !== currentWeek) {
        localStorage.setItem('lastWeek', currentWeek);
        localStorage.setItem('thisWeekGames', '1');
        localStorage.setItem('thisWeekPerfects', score === 10 ? '1' : '0');
    } else {
        const thisWeekGames = parseInt(localStorage.getItem('thisWeekGames') || '0') + 1;
        localStorage.setItem('thisWeekGames', thisWeekGames);
        
        const maxGamesInWeek = parseInt(localStorage.getItem('maxGamesInWeek') || '0');
        if (thisWeekGames > maxGamesInWeek) {
            localStorage.setItem('maxGamesInWeek', thisWeekGames);
        }
        
        if (score === 10) {
            const thisWeekPerfects = parseInt(localStorage.getItem('thisWeekPerfects') || '0') + 1;
            localStorage.setItem('thisWeekPerfects', thisWeekPerfects);
            
            const maxPerfectsInWeek = parseInt(localStorage.getItem('maxPerfectsInWeek') || '0');
            if (thisWeekPerfects > maxPerfectsInWeek) {
                localStorage.setItem('maxPerfectsInWeek', thisWeekPerfects);
            }
        }
    }
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7) + '-' + d.getUTCFullYear();
}

// Track consecutive game performance
function updateConsecutiveGameTracking(score) {
    const lastScore = parseInt(localStorage.getItem('lastGameScore') || '0');
    const lastScores = JSON.parse(localStorage.getItem('lastScores') || '[]');
    
    // Update last scores array (keep last 30)
    lastScores.push(score);
    if (lastScores.length > 30) lastScores.shift();
    localStorage.setItem('lastScores', JSON.stringify(lastScores));
    localStorage.setItem('lastGameScore', score);
    
    // Track consecutive streaks for different thresholds
    updateConsecutiveStreak('consecutiveStreak5Plus', score >= 5, lastScore >= 5);
    updateConsecutiveStreak('consecutiveStreak7Plus', score >= 7, lastScore >= 7);
    updateConsecutiveStreak('consecutiveStreak8Plus', score >= 8, lastScore >= 8);
    updateConsecutiveStreak('consecutiveStreak9Plus', score >= 9, lastScore >= 9);
    
    // Track non-decreasing streak
    if (lastScore > 0 && score >= lastScore) {
        const streak = parseInt(localStorage.getItem('consecutiveNonDecreasing') || '0') + 1;
        localStorage.setItem('consecutiveNonDecreasing', streak);
    } else if (lastScore > 0) {
        localStorage.setItem('consecutiveNonDecreasing', '1');
    }
    
    // Check for trifecta pattern (10, 9, 10)
    if (lastScores.length >= 3) {
        const recent3 = lastScores.slice(-3);
        if (recent3[0] === 10 && recent3[1] === 9 && recent3[2] === 10) {
            const trifecta = parseInt(localStorage.getItem('trifecta') || '0');
            localStorage.setItem('trifecta', trifecta + 1);
        }
    }
    
    // Track personal best
    const personalBest = parseInt(localStorage.getItem('personalBest') || '0');
    if (score > personalBest) {
        localStorage.setItem('personalBest', score);
        
        // Check if beat personal best twice in a day
        const today = new Date().toDateString();
        const lastBestDate = localStorage.getItem('lastBestDate');
        const bestBeatsToday = parseInt(localStorage.getItem('bestBeatsToday') || '0');
        
        if (lastBestDate === today) {
            localStorage.setItem('bestBeatsToday', bestBeatsToday + 1);
            if (bestBeatsToday + 1 >= 2) {
                localStorage.setItem('beatPersonalBestTwiceInDay', '1');
            }
        } else {
            localStorage.setItem('lastBestDate', today);
            localStorage.setItem('bestBeatsToday', '1');
        }
    }
}

function updateConsecutiveStreak(key, currentMeets, lastMeets) {
    if (currentMeets) {
        if (lastMeets || parseInt(localStorage.getItem(key) || '0') === 0) {
            const streak = parseInt(localStorage.getItem(key) || '0') + 1;
            localStorage.setItem(key, streak);
        } else {
            localStorage.setItem(key, '1');
        }
    } else {
        localStorage.setItem(key, '0');
    }
}

// Track special patterns for the completed game
function trackGamePatterns(setStart, setEnd) {
    // Check first 5 questions correct
    let first5AllCorrect = true;
    for (let i = setStart; i < setStart + 5 && i < setEnd; i++) {
        if (levelResults[i] !== true) {
            first5AllCorrect = false;
            break;
        }
    }
    if (first5AllCorrect) {
        const count = parseInt(localStorage.getItem('first5Correct') || '0') + 1;
        localStorage.setItem('first5Correct', count);
    }
    
    // Check last 5 questions correct
    let last5AllCorrect = true;
    for (let i = setEnd - 5; i < setEnd; i++) {
        if (levelResults[i] !== true) {
            last5AllCorrect = false;
            break;
        }
    }
    if (last5AllCorrect) {
        const count = parseInt(localStorage.getItem('last5Correct') || '0') + 1;
        localStorage.setItem('last5Correct', count);
    }
    
    // Track first question correct
    if (levelResults[setStart] === true) {
        const count = parseInt(localStorage.getItem('firstQuestionCorrect') || '0') + 1;
        localStorage.setItem('firstQuestionCorrect', count);
    }
    
    // Track last question correct
    if (levelResults[setEnd - 1] === true) {
        const count = parseInt(localStorage.getItem('lastQuestionCorrect') || '0') + 1;
        localStorage.setItem('lastQuestionCorrect', count);
    }
    
    // Track bookends (first AND last correct)
    if (levelResults[setStart] === true && levelResults[setEnd - 1] === true) {
        const count = parseInt(localStorage.getItem('bookends') || '0') + 1;
        localStorage.setItem('bookends', count);
    }
}

// Persistent score frequency tracking
function updateScoreFrequency(score) {
    let freq = JSON.parse(localStorage.getItem('scoreFrequency') || '{}');
    for (let i = 0; i <= 10; i++) {
        if (typeof freq[i] !== 'number') freq[i] = 0;
    }
    freq[score]++;
    localStorage.setItem('scoreFrequency', JSON.stringify(freq));
    
    // Update total games and score sum
    const totalGames = parseInt(localStorage.getItem('totalGames') || '0') + 1;
    localStorage.setItem('totalGames', totalGames);
    
    const totalScoreSum = parseInt(localStorage.getItem('totalScoreSum') || '0') + score;
    localStorage.setItem('totalScoreSum', totalScoreSum);
    
    // Update daily and weekly tracking
    updateDailyTracking();
    updateWeeklyTracking(score);
    updateConsecutiveGameTracking(score);
}
// Game State
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

    // Track streaks
    updateStreak(isCorrect);

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
    
    // Track special patterns for this game
    trackGamePatterns(setStart, setEnd);
    
    // Update persistent score frequency (this also updates totals, daily, weekly, consecutive tracking)
    updateScoreFrequency(correct);
    
    // Reset current game answers for next game
    currentGameAnswers = [];
    
    // Unlock achievements and show unlocked achievement if any
    const newlyUnlocked = unlockAchievements();
    
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

// Achievements modal logic
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
        achievementsModal.style.display = 'none';
    });
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
