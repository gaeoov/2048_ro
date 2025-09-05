// roguelike.js

const BIG_MILESTONES = [1024, 2048, 4096, 8192]; // Updated Big Milestones
let reachedBigMilestones = new Set();

// New Small Milestone Tracking
const SMALL_MILESTONE_TRIGGERS = {
    16: { first: false, count: 0, triggerEvery: 5 }, // New trigger for 16
    64: { first: false, count: 0, triggerEvery: 4 },
    256: { first: false, count: 0, triggerEvery: 3 },
};
let reachedSmallMilestones = new Set(); // To track specific triggers (e.g., '32-first', '64-2nd')

let activePassiveEffects = []; // Stores names of active passive effects
const MAX_PASSIVE_SLOTS = 4; // Updated Max Passive Slots

const POWERFUL_ONE_TIME_EFFECTS = [
    'scoreBoost',
    'shuffleBoard',
    'clearAnyTile',
    'duplicateRandomTile'
];

// New function to report tile values for milestone tracking
function reportTileValue(value) {
    // Check for Big Milestones
    for (const milestone of BIG_MILESTONES) {
        if (value === milestone && !reachedBigMilestones.has(milestone)) {
            reachedBigMilestones.add(milestone);
            console.log(`Big Milestone Reached: ${milestone}`);
            triggerRewardSelection('big');
            updateNextMilestoneDisplay(); // Update display after triggering a big milestone
            return; // Only trigger one milestone at a time
        }
    }

    // Check for Small Milestones
    if (SMALL_MILESTONE_TRIGGERS[value]) {
        const trigger = SMALL_MILESTONE_TRIGGERS[value];
        trigger.count++;

        // First appearance
        if (!trigger.first) {
            trigger.first = true;
            if (!reachedSmallMilestones.has(`${value}-first`)) {
                reachedSmallMilestones.add(`${value}-first`);
                console.log(`Small Milestone Reached: ${value} (First appearance)`);
                triggerRewardSelection('small');
                updateNextMilestoneDisplay(); // Update display after triggering a small milestone
                return;
            }
        }

        // Subsequent appearances
        if (trigger.count > 1 && (trigger.count - 1) % trigger.triggerEvery === 0) {
            if (!reachedSmallMilestones.has(`${value}-${trigger.count}th`)) {
                reachedSmallMilestones.add(`${value}-${trigger.count}th`);
                console.log(`Small Milestone Reached: ${value} (${trigger.count}th appearance)`);
                triggerRewardSelection('small');
                updateNextMilestoneDisplay(); // Update display after triggering a small milestone
                return;
            }
        }
    }

    // Check for Late Game (based on max tile value, not individual tile creation)
    // This logic remains in checkForMilestones as it's a global board state check
    updateNextMilestoneDisplay(); // Update display after any tile value change (even if not a milestone)
}

// Function to check for milestones (now primarily for Late Game)
function checkForMilestones() {
    let maxTileValue = 0;
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] > maxTileValue) {
                maxTileValue = board[r][c];
            }
        }
    }

    // Check for Late Game
    if (maxTileValue >= LATE_GAME_THRESHOLD_VALUE) {
        // We need a way to ensure late game options are triggered only once per milestone value
        // For simplicity, let's assume reaching this value for the first time triggers it.
        // A more robust solution would involve tracking if late game options have been presented for this maxTileValue.
        if (!reachedBigMilestones.has(LATE_GAME_THRESHOLD_VALUE)) { // Use big milestone set to track this
            reachedBigMilestones.add(LATE_GAME_THRESHOLD_VALUE);
            console.log(`Late Game Threshold Reached: ${maxTileValue}`);
            triggerRewardSelection('lateGame');
            updateNextMilestoneDisplay(); // Update display after triggering late game
            return;
        }
    }
}

// Function to trigger the reward selection modal
function triggerRewardSelection(milestoneType) {
    console.log(`Triggering reward selection for ${milestoneType} milestone...`);
    const rewardModal = document.getElementById('reward-modal');
    const rewardOptionsContainer = document.getElementById('reward-options');
    rewardOptionsContainer.innerHTML = ''; // Clear previous options

    if (milestoneType === 'lateGame') {
        // Late Game options: Replace Passive or Powerful One-Time
        const replacePassiveDiv = document.createElement('div');
        replacePassiveDiv.classList.add('reward-option');
        replacePassiveDiv.innerHTML = `<h3>패시브 교체</h3><p>활성 패시브 효과를 제거하고 새로운 것을 선택합니다.</p>`;
        replacePassiveDiv.addEventListener('click', () => {
            displayPassiveReplacementOptions();
        });
        rewardOptionsContainer.appendChild(replacePassiveDiv);

        const powerfulOneTimeDiv = document.createElement('div');
        powerfulOneTimeDiv.classList.add('reward-option');
        powerfulOneTimeDiv.innerHTML = `<h3>강력한 단발성 효과</h3><p>강력한 일회성 보너스를 받습니다.</p>`;
        powerfulOneTimeDiv.addEventListener('click', () => {
            displayPowerfulOneTimeOptions();
        });
        rewardOptionsContainer.appendChild(powerfulOneTimeDiv);

    } else {
        let availableRewards = [];
        if (milestoneType === 'small') {
            availableRewards = Object.keys(oneTimeEffects);
        } else if (milestoneType === 'big') {
            availableRewards = Object.keys(passiveEffects);
        }

        // Select 3 random rewards
        let selectedRewards = [];
        let rewardsToChooseFrom = [...availableRewards];
        for (let i = 0; i < 3; i++) {
            if (rewardsToChooseFrom.length > 0) {
                const randomIndex = Math.floor(Math.random() * rewardsToChooseFrom.length);
                selectedRewards.push(rewardsToChooseFrom[randomIndex]);
                rewardsToChooseFrom.splice(randomIndex, 1); // Remove to avoid duplicates
            }
        }

        selectedRewards.forEach(rewardName => {
            let reward;
            let rewardType;
            if (milestoneType === 'small') {
                reward = oneTimeEffects[rewardName];
                rewardType = 'oneTime';
            } else {
                reward = passiveEffects[rewardName];
                rewardType = 'passive';
            }

            const rewardDiv = document.createElement('div');
            rewardDiv.classList.add('reward-option');
            rewardDiv.dataset.rewardType = rewardType;
            rewardDiv.dataset.rewardName = rewardName;
            rewardDiv.innerHTML = `
                <h3>${reward.name}</h3>
                <p>${reward.description}</p>
            `;
            rewardOptionsContainer.appendChild(rewardDiv);
        });
    }

    rewardModal.style.display = 'block';
    setupRewardListeners(); // Re-attach listeners for newly created elements
}

function displayPassiveReplacementOptions() {
    const rewardOptionsContainer = document.getElementById('reward-options');
    rewardOptionsContainer.innerHTML = '';

    if (activePassiveEffects.length === 0) {
        rewardOptionsContainer.innerHTML = '<p>교체할 활성 패시브 효과가 없습니다.</p>';
        return;
    }

    const title = document.createElement('h3');
    title.textContent = "교체할 패시브 선택";
    rewardOptionsContainer.appendChild(title);

    activePassiveEffects.forEach(effectName => {
        const passive = passiveEffects[effectName];
        const replaceOptionDiv = document.createElement('div');
        replaceOptionDiv.classList.add('reward-option');
        replaceOptionDiv.innerHTML = `<h3>${passive.name}</h3><p>${passive.description}</p>`;
        replaceOptionDiv.addEventListener('click', () => {
            // Remove old passive
            removePassiveEffect(effectName);
            // Offer new passive selection
            displayNewPassiveSelection();
        });
        rewardOptionsContainer.appendChild(replaceOptionDiv);
    });
}

function displayNewPassiveSelection() {
    const rewardOptionsContainer = document.getElementById('reward-options');
    rewardOptionsContainer.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = "새로운 패시브 효과 선택";
    rewardOptionsContainer.appendChild(title);

    let availablePassives = Object.keys(passiveEffects);
    let selectedPassives = [];
    let passivesToChooseFrom = [...availablePassives];
    for (let i = 0; i < 3; i++) {
        if (passivesToChooseFrom.length > 0) {
            const randomIndex = Math.floor(Math.random() * passivesToChooseFrom.length);
            selectedPassives.push(passivesToChooseFrom[randomIndex]);
            passivesToChooseFrom.splice(randomIndex, 1);
        }
    }

    selectedPassives.forEach(passiveName => {
        const passive = passiveEffects[passiveName];
        const passiveDiv = document.createElement('div');
        passiveDiv.classList.add('reward-option');
        passiveDiv.dataset.rewardType = 'passive';
        passiveDiv.dataset.rewardName = passiveName;
        passiveDiv.innerHTML = `<h3>${passive.name}</h3><p>${passive.description}</p>`;
        rewardOptionsContainer.appendChild(passiveDiv);
    });
    setupRewardListeners(); // Re-attach listeners
}

function displayPowerfulOneTimeOptions() {
    const rewardOptionsContainer = document.getElementById('reward-options');
    rewardOptionsContainer.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = "강력한 단발성 효과 선택";
    rewardOptionsContainer.appendChild(title);

    let selectedPowerfulEffects = [];
    let powerfulEffectsToChooseFrom = [...POWERFUL_ONE_TIME_EFFECTS];
    for (let i = 0; i < 3; i++) {
        if (powerfulEffectsToChooseFrom.length > 0) {
            const randomIndex = Math.floor(Math.random() * powerfulEffectsToChooseFrom.length);
            selectedPowerfulEffects.push(powerfulEffectsToChooseFrom[randomIndex]);
            powerfulEffectsToChooseFrom.splice(randomIndex, 1);
        }
    }

    selectedPowerfulEffects.forEach(effectName => {
        const effect = oneTimeEffects[effectName];
        const effectDiv = document.createElement('div');
        effectDiv.classList.add('reward-option');
        effectDiv.dataset.rewardType = 'oneTime';
        effectDiv.dataset.rewardName = effectName;
        effectDiv.innerHTML = `<h3>${effect.name}</h3><p>${effect.description}</p>`;
        rewardOptionsContainer.appendChild(effectDiv);
    });
    setupRewardListeners(); // Re-attach listeners
}

function updateActivePassivesDisplay() {
    const activePassivesDiv = document.getElementById('active-passives');
    activePassivesDiv.innerHTML = '<h3>활성 패시브:</h3>'; // Reset content

    if (activePassiveEffects.length === 0) {
        activePassivesDiv.innerHTML += '<p>없음</p>';
        return;
    }

    activePassiveEffects.forEach(effectName => {
        const passive = passiveEffects[effectName];
        const p = document.createElement('p');
        p.textContent = `- ${passive.name}`; // Display only name for brevity
        activePassivesDiv.appendChild(p);
    });
}

function updateNextMilestoneDisplay() {
    const nextMilestonesDiv = document.getElementById('next-milestones');
    nextMilestonesDiv.innerHTML = '<h3>다음 마일스톤:</h3>'; // Reset content

    let hasUpcomingMilestone = false;

    // Display Small Milestones
    for (const value of Object.keys(SMALL_MILESTONE_TRIGGERS)) {
        const trigger = SMALL_MILESTONE_TRIGGERS[value];
        let remaining = 0;

        if (!trigger.first) {
            remaining = 1; // Needs to appear once for the first trigger
        } else {
            // Calculate remaining for subsequent triggers
            const nextTriggerCount = Math.floor((trigger.count / trigger.triggerEvery)) * trigger.triggerEvery + trigger.triggerEvery;
            remaining = nextTriggerCount - trigger.count;
        }

        // Only display if it's an upcoming milestone
        if (remaining > 0) {
            hasUpcomingMilestone = true;
            const p = document.createElement('p');
            p.textContent = `${value} : -${remaining}`;
            nextMilestonesDiv.appendChild(p);
        }
    }

    // Display Big Milestones (only the next one)
    let nextBigMilestone = null;
    for (const milestone of BIG_MILESTONES) {
        if (!reachedBigMilestones.has(milestone)) {
            nextBigMilestone = milestone;
            break;
        }
    }
    if (nextBigMilestone) {
        hasUpcomingMilestone = true;
        const p = document.createElement('p');
        p.textContent = `큰 마일스톤: ${nextBigMilestone}`;
        nextMilestonesDiv.appendChild(p);
    }

    if (!hasUpcomingMilestone) {
        nextMilestonesDiv.innerHTML += '<p>모든 마일스톤 달성!</p>';
    }
}

// Function to apply a chosen reward
function applyReward(rewardType, rewardName) {
    console.log(`Applying reward: ${rewardType} - ${rewardName}`);
    if (rewardType === 'oneTime') {
        if (oneTimeEffects[rewardName]) {
            oneTimeEffects[rewardName].apply();
        }
    } else if (rewardType === 'passive') {
        if (passiveEffects[rewardName]) {
            // If replacing a passive, it's already handled by displayPassiveReplacementOptions
            // This part is for initial passive selection or new passive after replacement
            if (!activePassiveEffects.includes(rewardName)) { // Avoid adding duplicates if somehow triggered
                if (activePassiveEffects.length < MAX_PASSIVE_SLOTS) {
                    applyPassiveEffect(rewardName);
                    activePassiveEffects.push(rewardName);
                } else {
                    // This case should ideally not be hit if replacement logic is followed
                    console.log("Passive slots full, and no replacement initiated.");
                }
            }
        }
    }
    // Close the modal
    document.getElementById('reward-modal').style.display = 'none';
    drawBoard(); // Redraw board after applying effect
    updateActivePassivesDisplay(); // Update display after applying a passive
    updateNextMilestoneDisplay(); // Update display after applying a reward
}