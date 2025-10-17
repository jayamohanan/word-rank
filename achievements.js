// Achievements Module
// This file contains all achievement-related logic

// Achievements definitions
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
  { id: 'strong_finish', name: 'Strong Finish', desc: 'Get the last 5 questions of a game correct', icon: '🏁', priority: 15,
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
  { id: 'reliable', name: 'Reliable', desc: 'Achieve a score of 7/10 or higher in 5 consecutive games', icon: '🎯', priority: 27,
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
  { id: 'perfection_incarnate', name: 'Perfection Incarnate', desc: 'Achieve 100 total perfect 10/10 scores', icon: '👑', priority: 62,
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
  { id: 'absolute_perfection', name: 'Absolute Perfection', desc: 'Achieve 30 consecutive games with a score of 8/10 or higher', icon: '💎', priority: 75,
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
function trackGamePatterns(setStart, setEnd, levelResults) {
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

// Update total correct count
function updateTotalCorrect() {
    const totalCorrect = parseInt(localStorage.getItem('totalCorrect') || '0') + 1;
    localStorage.setItem('totalCorrect', totalCorrect);
}

// Reset current game answers
function resetGameAnswers() {
    currentGameAnswers = [];
}

// Export functions for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        unlockAchievements,
        renderAchievementsBoard,
        updateStreak,
        trackGamePatterns,
        updateScoreFrequency,
        updateTotalCorrect,
        resetGameAnswers
    };
}
