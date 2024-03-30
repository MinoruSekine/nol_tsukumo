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
 * @param {number} current_level - Current level
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
	1920053
    ];

    return kExpToNextLevel[level];
}

/**
 * Calculate exp to specified level.
 *
 * @param {number} current_level - Current level
 * @param {number} current_exp - Current exp
 * @param {number} to_level - Level to raise
 * @return {number} Necessary exp to to_level
 */
function calcExpToSpecifiedLevel(current_level, current_exp, to_level) {
    const expToNextLevel = getExpToNextLevel(current_level);
    let exp = expToNextLevel - current_exp;
    for (var level = current_level + 1; level < to_level; ++level) {
	exp += getExpToNextLevel(level);
    }
    return exp;
}

/**
 * Exp per a tsukumo source.
 *
 * @param {number} gain - Multiplier for exp, usually x1.0, and x1.5 in campaign
 * @return Exp per a tsukumo source
 */
function getExpPerATsukumoSource(gain) {
    return 10 * gain;
}

/**
 * Calculate number of tsukumo source to specified level.
 *
 * @param {number} current_level - Current level
 * @param {number} current_exp - Current exp
 * @param {number} to_level - Level to raise
 * @param {number} gain - Multiplier for exp, usually x1.0, and x1.5 in campaign
 * @return {number} Number of necessary tsukumo source to to_level
 */
function calcTsukumoSourceToSpecifiedLevel(current_level, current_exp, to_level, gain) {
    return Math.ceil(calcExpToSpecifiedLevel(current_level, current_exp, to_level)
		     / getExpPerATsukumoSource(gain));
}

/**
 * Validate current inputs to calculate.
 *
 * @param {number} current_level - Current level
 * @param {number} current_exp - Current exp
 * @param {number} to_level - Level to raise
 * @return {boolean} Enabled to calculate or not
 */
function isEnabledToCalculate(current_level, current_exp, to_level) {
    return ((current_level < to_level)
	    && (current_exp < getExpToNextLevel(current_level)));
}

/**
 * Update all elements on HTML by current inputs.
 */
function update() {
    const current_level = parseInt(document.getElementById('current-level-input').value, 10);
    const current_exp = parseInt(document.getElementById('exp-input').value, 10);
    const to_level = parseInt(document.getElementById('to-level-input').value, 10);
    if (isEnabledToCalculate(current_level, current_exp, to_level)) {
	const gain = parseFloat(document.getElementById('tsukumo-gain-input').value, 10);

	let exp_input = document.getElementById('tsukumo-exp-input');
	exp_input.value = calcExpToSpecifiedLevel(current_level, current_exp, to_level);
	let tsukumo_source_input = document.getElementById('tsukumo-source-input');
	tsukumo_source_input.value = calcTsukumoSourceToSpecifiedLevel(current_level, current_exp, to_level, gain);
    }
}

window.onload = () => {
    let current_level_input = document.getElementById('current-level-input');
    current_level_input.addEventListener('input', () => {
	update();
    });

    let current_exp_input = document.getElementById('exp-input');
    current_exp_input.addEventListener('input', () => {
	update();
    });

    let to_level_input = document.getElementById('to-level-input');
    to_level_input.addEventListener('input', () => {
	update();
    });

    let tsukumo_gain_input = document.getElementById('tsukumo-gain-input');
    tsukumo_gain_input.addEventListener('input', () => {
	update();
    });

    update();
};
