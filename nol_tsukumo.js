/**
 * @overview Functions to calculate number of tsukumo source
 *           to increase to specified level
 *           of Nobunaga's ambition Online.
 *
 * @author Minoru Sekine
 * @copyright Copyrght 2024 Minoru Sekine
 */

/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Get exp to next level.
 *
 * @param {number} level - Current level
 * @return {number} Exp to next level
 */
function getExpToNextLevel(level) {
  const kExpToNextLevel = [
    500,
    1135,
    1642,
    2285,
    3102,
    4139,
    5456,
    7130,
    9255,
    11935,
    15381,
    19734,
    25262,
    32282,
    41199,
    52522,
    66903,
    85167,
    108362,
    137820,
    175231,
    222744,
    283085,
    359717,
    457041,
    580642,
    737615,
    936971,
    1190154,
    1511695,
    1920053,
  ];

  return kExpToNextLevel[level];
}

/**
 * Calculate exp to specified level.
 *
 * @param {number} currentLevel - Current level
 * @param {number} currentExp - Current exp
 * @param {number} toLevel - Level to raise
 * @return {number} Necessary exp to toLevel
 */
function calcExpToSpecifiedLevel(currentLevel, currentExp, toLevel) {
  const expToNextLevel = getExpToNextLevel(currentLevel);
  let exp = expToNextLevel - currentExp;
  for (let level = currentLevel + 1; level < toLevel; ++level) {
    exp += getExpToNextLevel(level);
  }
  return exp;
}

/**
 * Exp per a tsukumo source.
 *
 * @param {number} gain - Multiplier for exp, usually x1.0, and x1.5 in campaign
 * @param {number} activeTsukumoNum - Current activated number of tsukumo power
 * @return {number} Exp per a tsukumo source
 */
function getExpPerATsukumoSource(gain, activeTsukumoNum) {
  return 10 * gain * (activeTsukumoNum + 1);
}

/**
 * Calculate number of tsukumo source to specified level.
 *
 * @param {number} currentLevel - Current level
 * @param {number} currentExp - Current exp
 * @param {number} activeTsukumoNum - Number of current active tsukumo power
 * @param {number} toLevel - Level to raise
 * @param {number} gain - Multiplier for exp, usually x1.0, and x1.5 in campaign
 * @return {number} Number of necessary tsukumo source to toLevel
 */
function calcTsukumoSourceToSpecifiedLevel(
    currentLevel, currentExp, activeTsukumoNum, toLevel, gain) {
  return Math.ceil(calcExpToSpecifiedLevel(currentLevel, currentExp, toLevel) /
                   getExpPerATsukumoSource(gain, activeTsukumoNum));
}

/**
 * Validate current inputs to calculate.
 *
 * @param {number} currentLevel - Current level
 * @param {number} currentExp - Current exp
 * @param {number} toLevel - Level to raise
 * @return {boolean} Enabled to calculate or not
 */
function isEnabledToCalculate(currentLevel, currentExp, toLevel) {
  return ((currentLevel < toLevel) &&
          (currentExp < getExpToNextLevel(currentLevel)));
}

/**
 * Update all elements on HTML by current inputs.
 */
function update() {
  const currentLevel =
    parseInt(document.getElementById('current-level-input').value, 10);

  const maxExpOfCurrentLevel = getExpToNextLevel(currentLevel) - 1;

  const currentExpInput = document.getElementById('exp-input');
  const currentExp =
    Math.min(parseInt(currentExpInput.value, 10), maxExpOfCurrentLevel);
  currentExpInput.max = maxExpOfCurrentLevel;
  currentExpInput.value = currentExp;

  const toLevelInput = document.getElementById('to-level-input');
  const minToLevel = currentLevel + 1;
  const toLevel = Math.max(parseInt(toLevelInput.value, 10), minToLevel);
  toLevelInput.min = minToLevel;
  toLevelInput.value = toLevel;

  if (isEnabledToCalculate(currentLevel, currentExp, toLevel)) {
    const activeTsukumoNum =
      parseInt(document.getElementById('active-tsukumo-num-input').value, 10);
    const gain =
      parseFloat(document.getElementById('tsukumo-gain-input').value, 10);

    const expInput = document.getElementById('tsukumo-exp-input');
    expInput.value = calcExpToSpecifiedLevel(currentLevel, currentExp, toLevel);
    const tsukumoSourceInput = document.getElementById('tsukumo-source-input');
    tsukumoSourceInput.value =
      calcTsukumoSourceToSpecifiedLevel(
          currentLevel, currentExp, activeTsukumoNum, toLevel, gain);
  }
}

window.onload = () => {
  const idToUpdateByChange = [
    'current-level-input',
    'exp-input',
    'active-tsukumo-num-input',
    'to-level-input',
    'tsukumo-gain-input',
  ];
  idToUpdateByChange.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      update();
    });
  });

  update();
};
