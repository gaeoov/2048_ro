// passive_effects.js

const passiveEffects = {
    increasedFourSpawnRate: {
        name: "4 생성 확률 증가",
        description: "2 대신 4 타일이 생성될 확률이 증가합니다.",
        apply: function() {
            window.fourSpawnBias = (window.fourSpawnBias || 0) + 0.1; // Increase 4 spawn chance by 10%
            console.log("Applied Passive: 4 생성 확률 증가");
        },
        remove: function() {
            window.fourSpawnBias = (window.fourSpawnBias || 0) - 0.1;
        }
    },
    scoreMultiplierSmall: {
        name: "점수 배율 (소)",
        description: "모든 점수 획득량이 10% 증가합니다.",
        apply: function() {
            window.scoreMultiplier = (window.scoreMultiplier || 1) * 1.1;
            console.log("Applied Passive: 점수 배율 (소)");
        },
        remove: function() {
            window.scoreMultiplier = (window.scoreMultiplier || 1) / 1.1;
        }
    },
    reducedTwoSpawnRate: {
        name: "2 생성 확률 감소",
        description: "2 타일이 생성될 확률이 감소합니다.",
        apply: function() {
            window.twoSpawnBias = (window.twoSpawnBias || 0) - 0.1; // Decrease 2 spawn chance by 10%
            console.log("Applied Passive: 2 생성 확률 감소");
        },
        remove: function() {
            window.twoSpawnBias = (window.twoSpawnBias || 0) + 0.1;
        }
    },
    tileValueDecay: {
        name: "타일 값 감소",
        description: "5번의 이동 후, 2 또는 4 값을 가진 모든 타일이 0으로 감소합니다. (플레이스홀더)",
        apply: function() {
            window.tileDecayActive = true;
            window.movesSinceLastDecay = 0;
            console.log("Applied Passive: 타일 값 감소 (플레이스홀더)");
            // Actual implementation would require a counter and board modification in game.js
        },
        remove: function() {
            window.tileDecayActive = false;
            window.movesSinceLastDecay = 0;
        }
    },
    scoreOnMove: {
        name: "이동 시 점수 획득",
        description: "매 이동마다 10점을 획득합니다.",
        apply: function() {
            window.scoreOnMoveActive = true;
            console.log("Applied Passive: 이동 시 점수 획득");
        },
        remove: function() {
            window.scoreOnMoveActive = false;
        }
    },
    emptyTileBonus: {
        name: "빈 타일 보너스",
        description: "매 턴 종료 시, 보드의 빈 타일 하나당 5점을 획득합니다.",
        apply: function() {
            window.emptyTileBonusActive = true;
            console.log("Applied Passive: 빈 타일 보너스");
        },
        remove: function() {
            window.emptyTileBonusActive = false;
        }
    }
};

// Function to apply passive effects (called by roguelike.js)
function applyPassiveEffect(effectName) {
    if (passiveEffects[effectName]) {
        passiveEffects[effectName].apply();
    }
}

// Function to remove passive effects (if slot limit is reached and replaced)
function removePassiveEffect(effectName) {
    if (passiveEffects[effectName] && passiveEffects[effectName].remove) {
        passiveEffects[effectName].remove();
    }
    // Remove from activePassiveEffects array
    const index = activePassiveEffects.indexOf(effectName);
    if (index > -1) {
        activePassiveEffects.splice(index, 1);
    }
    updateActivePassivesDisplay(); // Update display after removing a passive
}