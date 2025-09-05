// rewards.js

function setupRewardListeners() {
    const rewardOptionsContainer = document.getElementById('reward-options');
    if (rewardOptionsContainer) {
        rewardOptionsContainer.addEventListener('click', (event) => {
            const target = event.target.closest('.reward-option');
            if (target) {
                const rewardType = target.dataset.rewardType;
                const rewardName = target.dataset.rewardName;
                applyReward(rewardType, rewardName);
            }
        });
    }
}

// Close button for the modal
const closeButton = document.querySelector('#reward-modal .close-button');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        document.getElementById('reward-modal').style.display = 'none';
    });
}

// Close the modal if clicked outside of it
window.addEventListener('click', (event) => {
    const rewardModal = document.getElementById('reward-modal');
    if (event.target === rewardModal) {
        rewardModal.style.display = 'none';
    }
});
