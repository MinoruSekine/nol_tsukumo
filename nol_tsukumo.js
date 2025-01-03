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
 * Tsukumo status of a weapon.
 */
class NolTsukumoStatus {
  level;
  exp;
  numOfActivatedTsukumo;

  /**
   * Constructor.
   * @param {number} level - Tsukumo level
   * @param {number} exp - Tsukumo exp of level (not total exp)
   * @param {number} numOfActivatedTsukumo - Number of activated Tsukumo power
   */
  constructor(level, exp, numOfActivatedTsukumo) {
    this.level = level;
    this.exp = exp;
    this.numOfActivatedTsukumo = numOfActivatedTsukumo;
  }
  /**
   * Convert status into string.
   * @return {string} String converted from this instance's status
   */
  toString() {
    let convertedString = '現在の九十九レベル:';
    convertedString += String(this.level);

    convertedString += ',';

    convertedString += '経験値:';
    convertedString += String(this.exp);

    convertedString += ',';

    convertedString += '発動数:';
    convertedString += String(this.numOfActivatedTsukumo);

    return convertedString;
  }
}

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
    11953,
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
 * @param {NolTsukumoStatus} currentStatus - Current Tsukumo status
 * @param {number} toLevel - Level to raise
 * @return {number} Necessary exp to toLevel
 */
function calcExpToSpecifiedLevel(currentStatus, toLevel) {
  const expToNextLevel = getExpToNextLevel(currentStatus.level);
  let exp = expToNextLevel - currentStatus.exp;
  for (let level = currentStatus.level + 1; level < toLevel; ++level) {
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
 * @param {NolTsukumoStatus} currentStatus - Current Tsukumo status
 * @param {number} toLevel - Level to raise
 * @param {number} gain - Multiplier for exp, usually x1.0, and x1.5 in campaign
 * @return {number} Number of necessary tsukumo source to toLevel
 */
function calcTsukumoSourceToSpecifiedLevel(currentStatus, toLevel, gain) {
  const requiredExp = calcExpToSpecifiedLevel(currentStatus, toLevel);
  const expPerTsukumoSource =
    getExpPerATsukumoSource(gain, currentStatus.numOfActivatedTsukumo);
  return Math.ceil(requiredExp / expPerTsukumoSource);
}

/**
 * Interface to observe NolTsukumoModel.
 */
class NolTsukumoModelObserverInterface {
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated current exp
   */
  onUpdateCurrentExp(exp) {
  }
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(level) {
  }
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(maxExp) {
  }
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(toLevel) {
  }
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(toLevelMin) {
  }
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(exp, source) {
  }
  /**
   * Call when log text has been changed.
   * @param {string} logText - Current whole log text.
   */
  onLogTextChanged(logText) {
  }
}

/**
 * Model of Nol Tsukumo calculator.
 */
class NolTsukumoModel {
  #currentStatus = new NolTsukumoStatus(0, 0, 0);
  #toLevel = 1;
  #toLevelMin = 1;
  #gain = 1.0;
  #observers = [];
  #logTextHistory = [];
  /**
   * Notify necessary Tsukumo exp and sources to observers.
   */
  #notifyNecessaryTsukumo() {
    const currentStatus = this.#currentStatus;
    const toLevel = this.#toLevel;
    const gain = this.#gain;
    const necessaryExp = calcExpToSpecifiedLevel(currentStatus, toLevel);
    const necessarySource =
          calcTsukumoSourceToSpecifiedLevel(currentStatus, toLevel, gain);
    this.#observers.forEach((observer) => {
      observer.onUpdateNecessaryTsukumo(necessaryExp, necessarySource);
    });
  }
  /**
   * Get current calculation result as string.
   * @return {string} String which represents current calculation result
   */
  #getResultString() {
    const necessaryExp =
          calcExpToSpecifiedLevel(this.#currentStatus, this.#toLevel);
    const necessarySource =
          calcTsukumoSourceToSpecifiedLevel(
              this.#currentStatus, this.#toLevel, this.#gain);
    let text = this.#currentStatus.toString();
    text += '\n';

    text += '目標レベル:';
    text += String(this.#toLevel);
    text += ',';
    text += '倍率:';
    text += String(this.#gain.toFixed(1));
    text += '\n';

    text += '　　　　↓\n';

    text += '必要な九十九の源:';
    text += String(necessarySource);
    text += ',';
    text += '経験値:';
    text += String(necessaryExp);
    text += '\n';

    return text;
  }
  /**
   * Initialize model instance.
   */
  initialize() {
    this.setCurrentLevel(0);
    this.setCurrentExp(0);
    this.setCurrentNumOfActuvatedTsukumo(0);
    this.setToLevel(1);
    this.setGain(1.0);
  }
  /**
   * Set current Tsukmo level.
   * @param {number} level - Current Tsukumo level
   */
  setCurrentLevel(level) {
    this.#currentStatus.level = level;
    this.#currentStatus.maxExpOfCurrentLevel = getExpToNextLevel(level);
    this.#observers.forEach((observer) => {
      observer.onUpdateCurrentLevel(level);

      const max = getExpToNextLevel(level) - 1;
      observer.onUpdateMaxExpOfCurrentLevel(max);

      if (this.#currentStatus.level >= this.#toLevelMin) {
        this.#toLevelMin = this.#currentStatus.level + 1;
        observer.onUpdateToLevelMin(this.#toLevelMin);
        if (this.#toLevel < this.#toLevelMin) {
          this.#toLevel = this.#toLevelMin;
          observer.onUpdateToLevel(this.#toLevel);
        }
      }
    });
    this.#notifyNecessaryTsukumo();
  }
  /**
   * Set current Tsukmo exp.
   * @param {number} exp - Current Tsukumo exp
   */
  setCurrentExp(exp) {
    this.#currentStatus.exp = exp;
    this.#notifyNecessaryTsukumo();
  }
  /**
   * Set current Tsukmo exp.
   * @param {number} numOfActivatedTsukumo - Current number of activated tsukmo
   */
  setCurrentNumOfActuvatedTsukumo(numOfActivatedTsukumo) {
    this.#currentStatus.numOfActivatedTsukumo = numOfActivatedTsukumo;
    this.#notifyNecessaryTsukumo();
  }
  /**
   * Set "to level".
   * @param {number} level - Expected "to level".
   */
  setToLevel(level) {
    this.#toLevel = level;
    this.#notifyNecessaryTsukumo();
  }
  /**
   * Set gain of tsukumo source into tsukumo exp.
   * @param {number} gain - Gain of tsukumo source into tsukumo exp
   */
  setGain(gain) {
    this.#gain = gain;
    this.#notifyNecessaryTsukumo();
  }
  /**
   * Request log text to observer.
   * Result will be notified via
   * NolTsukumoModelObserverInterface::onLogTextChanged().
   */
  requestLogText() {
    let logText = '';
    if (this.#logTextHistory.length) {
      logText = this.#logTextHistory.at(-1);
    }
    if (logText) {
      logText += '\n';
    }
    logText += this.#getResultString();
    this.#logTextHistory.push(logText);
    this.#observers.forEach((observer) => {
      observer.onLogTextChanged(logText);
    });
  }
  /**
   * Clear log text.
   * Result will be notified via
   * NolTsukumoModelObserverInterface::onLogTextChanged().
   */
  clearLogText() {
    if (this.#logTextHistory.length) {
      this.#logTextHistory.push('');
      this.#observers.forEach((observer) => {
        observer.onLogTextChanged('');
      });
    }
  }
  /**
   * Undo log text change.
   */
  undoLogTextChange() {
    if (this.#logTextHistory.length) {
      this.#logTextHistory.pop();
      let latestLogText = '';
      if (this.#logTextHistory.length) {
        latestLogText = this.#logTextHistory.at(-1);
      }
      this.#observers.forEach((observer) => {
        observer.onLogTextChanged(latestLogText);
      });
    }
  }
  /**
   * Register observer of model.
   * @param {NolTsukumoModelObserverInterface} observer - Observer to Register.
   */
  registerObserver(observer) {
    this.#observers.push(observer);
  }
}

/**
 * View of In/Out area on Nol Tsukumo calculator.
 */
class NolTsukumoInOutView extends NolTsukumoModelObserverInterface {
  #currentExpInput = null;
  #toLevelInput = null;
  #necessaryExpInput = null;
  #necessarySourceInput = null;

  /**
   * Constructor of view.
   */
  constructor() {
    super();
  }
  /**
   * Initialize instance of view.
   * @param {NolTsukumoModel} model - Instance of model
   */
  initialize(model) {
    this.#currentExpInput = document.getElementById('exp-input');
    this.#toLevelInput = document.getElementById('to-level-input');
    this.#necessaryExpInput = document.getElementById('tsukumo-exp-input');
    this.#necessarySourceInput =
      document.getElementById('tsukumo-source-input');

    model.registerObserver(this);
  }
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated max exp of current level
   */
  onUpdateCurrentExp(exp) {
    this.#currentExpInput.value = exp;
  }
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(level) {
  }
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(maxExp) {
  }
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(toLevel) {
    this.#toLevelInput.value = toLevel;
  }
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(toLevelMin) {
  }
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(exp, source) {
    this.#necessaryExpInput.value = exp;
    this.#necessarySourceInput.value = source;
  }
}

/**
 * View of log area on Nol Tsukumo calculator.
 */
class NolTsukumoLogView extends NolTsukumoModelObserverInterface {
  #logTextarea = null;
  /**
   * Scroll log area to bottom.
   */
  #scrollLogAreaToBottom() {
    this.#logTextarea.scrollTop = this.#logTextarea.scrollHeight;
  }

  /**
   * Constructor of view.
   */
  constructor() {
    super();
  }
  /**
   * Initialize instance of view.
   * @param {NolTsukumoModel} model - Instance of model
   */
  initialize(model) {
    this.#logTextarea = document.getElementById('log-textarea');

    model.registerObserver(this);
  }
  /**
   * Call when log text has been changed.
   * @param {string} logText - Current whole log text.
   */
  onLogTextChanged(logText) {
    this.#logTextarea.value = logText;
    this.#scrollLogAreaToBottom();
  }
}

/**
 * Controller of Nol Tsukumo calculator.
 */
class NolTsukumoController extends NolTsukumoModelObserverInterface {
  #toLevelInput = null;
  #currentLevelInput = null;
  #currentExpInput = null;
  #currentNumOfActivatedTsukumo = null;
  #gainDropdown = null;
  #memoButton = null;
  #memoClearButton = null;
  #memoUndoButton = null;

  #model = null;

  /**
   * Constructor of NolTsukumoController.
   */
  constructor() {
    super();
  }
  /**
   * Initialize instance of controller.
   * @param {NolTsukumoModel} model - Instance of model.
   */
  initialize(model) {
    this.#toLevelInput = document.getElementById('to-level-input');
    this.#currentLevelInput = document.getElementById('current-level-input');
    this.#currentExpInput = document.getElementById('exp-input');
    this.#currentNumOfActivatedTsukumo =
      document.getElementById('active-tsukumo-num-select');
    this.#gainDropdown = document.getElementById('tsukumo-gain-dropdown');
    this.#memoButton = document.getElementById('memo-button');
    this.#memoClearButton = document.getElementById('memo-clear-button');
    this.#memoUndoButton = document.getElementById('memo-undo-button');

    this.#model = model;
    this.#model.registerObserver(this);

    this.#currentLevelInput.addEventListener('input', () => {
      this.#model.setCurrentLevel(parseInt(this.#currentLevelInput.value, 10));
    });

    this.#currentExpInput.addEventListener('input', () => {
      this.#model.setCurrentExp(parseInt(this.#currentExpInput.value, 10));
    });

    this.#currentNumOfActivatedTsukumo.addEventListener('change', () => {
      const numActivated =
            parseInt(this.#currentNumOfActivatedTsukumo.value, 10);
      this.#model.setCurrentNumOfActuvatedTsukumo(numActivated);
    });

    this.#toLevelInput.addEventListener('input', () => {
      this.#model.setToLevel(parseInt(this.#toLevelInput.value, 10));
    });

    this.#gainDropdown.addEventListener('change', () => {
      const gain = parseFloat(this.#gainDropdown.value);
      this.#model.setGain(gain);
    });

    this.#memoButton.addEventListener('click', () => {
      this.#model.requestLogText();
    });

    this.#memoClearButton.addEventListener('click', () => {
      this.#model.clearLogText();
    });

    this.#memoUndoButton.addEventListener('click', () => {
      this.#model.undoLogTextChange();
    });
  }
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated max exp of current level
   */
  onUpdateCurrentExp(exp) {
  }
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(level) {
    this.#toLevelInput.min = level + 1;
  }
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(maxExp) {
    this.#currentExpInput.max = maxExp;
    if (parseInt(this.#currentExpInput.value, 10) > maxExp) {
      this.#currentExpInput.value = maxExp;
    }
  }
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(toLevel) {
  }
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(toLevelMin) {
    this.#toLevelInput.min = toLevelMin;
  }
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(exp, source) {
  }
}

const gModel = new NolTsukumoModel();
const gInOutView = new NolTsukumoInOutView();
const gLogView = new NolTsukumoLogView();
const gController = new NolTsukumoController();

window.onload = () => {
  gInOutView.initialize(gModel);
  gLogView.initialize(gModel);
  gController.initialize(gModel);
  gModel.initialize();
};

