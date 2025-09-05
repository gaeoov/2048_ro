// roguelike.js

const BIG_MILESTONES = [2048, 4096, 8192, 16384, 32768];
const SMALL_MILESTONE_DIVISORS = [32, 8]; // For early/mid game
const LATE_GAME_THRESHOLD = 1024; // Example: when max tile reaches this, use different divisors
const LATE_GAME_SMALL_MILESTONE_DIVISORS = [16, 4];
const LATE_GAME_THRESHOLD_VALUE = 65536;

let reachedBigMilestones = new Set();
let reachedSmallMilestones = new Set();
let activePassiveEffects = []; // Stores names of active passive effects
const MAX_PASSIVE_SLOTS = 5;

const POWERFUL_ONE_TIME_EFFECTS = [
    'scoreBoost',
    'shuffleBoard',
    'clearAnyTile',
    'duplicateRandomTile'
];

// Function to check for milestones after each move
function checkForMilestones() {
    let maxTileValue = 0;
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (board[r][c] > maxTileValue) {
                maxTileValue = board[r][c];
            }
        }
    }

    // Check for Late Game first
    if (maxTileValue >= LATE_GAME_THRESHOLD_VALUE) {
        // Check if any milestone (big or small) is reached to trigger late game options
        let milestoneReachedThisTurn = false;
        for (const milestone of BIG_MILESTONES) {
            if (maxTileValue >= milestone && !reachedBigMilestones.has(milestone)) {
                reachedBigMilestones.add(milestone);
                milestoneReachedThisTurn = true;
                break;
            }
        }
        if (!milestoneReachedThisTurn) {
            const currentDivisors = maxTileValue >= LATE_GAME_THRESHOLD ? LATE_GAME_SMALL_MILESTONE_DIVISORS : SMALL_MILESTONE_DIVISORS;
            for (const divisor of currentDivisors) {
                const smallMilestoneValue = Math.floor(maxTileValue / divisor);
                if (smallMilestoneValue >= 2 && (smallMilestoneValue & (smallMilestoneValue - 1)) === 0) {
                    if (!reachedSmallMilestones.has(smallMilestoneValue)) {
                        reachedSmallMilestones.add(smallMilestoneValue);
                        milestoneReachedThisTurn = true;
                        break;
                    }
                }
            }
        }

        if (milestoneReachedThisTurn) {
            console.log(`Late Game Milestone Reached: ${maxTileValue}`);
            triggerRewardSelection('lateGame');
            return;
        }
    }

    // Check for Big Milestones
    for (const milestone of BIG_MILESTONES) {
        if (maxTileValue >= milestone && !reachedBigMilestones.has(milestone)) {
            reachedBigMilestones.add(milestone);
            console.log(`Big Milestone Reached: ${milestone}`);
            triggerRewardSelection('big');
            return; // Only trigger one milestone at a time
        }
    }

    // Check for Small Milestones if no Big Milestone was reached
    const currentDivisors = maxTileValue >= LATE_GAME_THRESHOLD ? LATE_GAME_SMALL_MILESTONE_DIVISORS : SMALL_MILESTONE_DIVISORS;
    for (const divisor of currentDivisors) {
        const smallMilestoneValue = Math.floor(maxTileValue / divisor);
        // Ensure small milestone is a power of 2 and not 0
        if (smallMilestoneValue >= 2 && (smallMilestoneValue & (smallMilestoneValue - 1)) === 0) {
            if (!reachedSmallMilestones.has(smallMilestoneValue)) { // Track the value itself
                reachedSmallMilestones.add(smallMilestoneValue);
                console.log(`Small Milestone Reached: maxTileValue/${divisor} = ${smallMilestoneValue}`);
                triggerRewardSelection('small');
                return; // Only trigger one milestone at a time
            }
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
}