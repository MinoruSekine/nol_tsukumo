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
  public level: number;
  public exp: number;
  public numOfActivatedTsukumo: number;

  /**
   * Constructor.
   * @param {number} level - Tsukumo level
   * @param {number} exp - Tsukumo exp of level (not total exp)
   * @param {number} numOfActivatedTsukumo - Number of activated Tsukumo power
   */
  constructor(level: number, exp: number, numOfActivatedTsukumo: number) {
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
function getExpToNextLevel(level: number) {
  /* prettier-ignore */ // tslint:disable typedef-whitespace
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
function calcExpToSpecifiedLevel(
  currentStatus: NolTsukumoStatus,
  toLevel: number,
) {
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
function getExpPerATsukumoSource(gain: number, activeTsukumoNum: number) {
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
function calcTsukumoSourceToSpecifiedLevel(
  currentStatus: NolTsukumoStatus,
  toLevel: number,
  gain: number,
) {
  const requiredExp = calcExpToSpecifiedLevel(currentStatus, toLevel);
  const expPerTsukumoSource = getExpPerATsukumoSource(
    gain,
    currentStatus.numOfActivatedTsukumo,
  );
  return Math.ceil(requiredExp / expPerTsukumoSource);
}

/**
 * Interface to observe NolTsukumoModel.
 */
interface NolTsukumoModelObserverInterface {
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated current exp
   */
  onUpdateCurrentExp(exp: number): void;
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(level: number): void;
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(maxExp: number): void;
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(toLevel: number): void;
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(toLevelMin: number): void;
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(exp: number, source: number): void;
  /**
   * Call when log text has been changed.
   * @param {string} logText - Current whole log text.
   */
  onLogTextChanged(logText: string): void;
}

/**
 * Model of Nol Tsukumo calculator.
 */
class NolTsukumoModel {
  private currentStatus = new NolTsukumoStatus(0, 0, 0);
  private toLevel = 1;
  private toLevelMin = 1;
  private gain = 1.0;
  private observers: NolTsukumoModelObserverInterface[] = [];
  private logTextHistory: string[] = [];
  /**
   * Notify necessary Tsukumo exp and sources to observers.
   */
  private notifyNecessaryTsukumo() {
    const currentStatus = this.currentStatus;
    const toLevel = this.toLevel;
    const gain = this.gain;
    const necessaryExp = calcExpToSpecifiedLevel(currentStatus, toLevel);
    const necessarySource = calcTsukumoSourceToSpecifiedLevel(
      currentStatus,
      toLevel,
      gain,
    );
    this.observers.forEach((observer: NolTsukumoModelObserverInterface) => {
      observer.onUpdateNecessaryTsukumo(necessaryExp, necessarySource);
    });
  }
  /**
   * Get current calculation result as string.
   * @return {string} String which represents current calculation result
   */
  private getResultString() {
    const necessaryExp = calcExpToSpecifiedLevel(
      this.currentStatus,
      this.toLevel,
    );
    const necessarySource = calcTsukumoSourceToSpecifiedLevel(
      this.currentStatus,
      this.toLevel,
      this.gain,
    );
    let text = this.currentStatus.toString();
    text += '\n';

    text += '目標レベル:';
    text += String(this.toLevel);
    text += ',';
    text += '倍率:';
    text += String(this.gain.toFixed(1));
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
  setCurrentLevel(level: number) {
    this.currentStatus.level = level;
    this.observers.forEach((observer: NolTsukumoModelObserverInterface) => {
      observer.onUpdateCurrentLevel(level);

      const max = getExpToNextLevel(level) - 1;
      observer.onUpdateMaxExpOfCurrentLevel(max);

      if (this.currentStatus.level >= this.toLevelMin) {
        this.toLevelMin = this.currentStatus.level + 1;
        observer.onUpdateToLevelMin(this.toLevelMin);
        if (this.toLevel < this.toLevelMin) {
          this.toLevel = this.toLevelMin;
          observer.onUpdateToLevel(this.toLevel);
        }
      }
    });
    this.notifyNecessaryTsukumo();
  }
  /**
   * Set current Tsukmo exp.
   * @param {number} exp - Current Tsukumo exp
   */
  setCurrentExp(exp: number) {
    this.currentStatus.exp = exp;
    this.notifyNecessaryTsukumo();
  }
  /**
   * Set current Tsukmo exp.
   * @param {number} numOfActivatedTsukumo - Current number of activated tsukmo
   */
  setCurrentNumOfActuvatedTsukumo(numOfActivatedTsukumo: number) {
    this.currentStatus.numOfActivatedTsukumo = numOfActivatedTsukumo;
    this.notifyNecessaryTsukumo();
  }
  /**
   * Set "to level".
   * @param {number} level - Expected "to level".
   */
  setToLevel(level: number) {
    this.toLevel = level;
    this.notifyNecessaryTsukumo();
  }
  /**
   * Set gain of tsukumo source into tsukumo exp.
   * @param {number} gain - Gain of tsukumo source into tsukumo exp
   */
  setGain(gain: number) {
    this.gain = gain;
    this.notifyNecessaryTsukumo();
  }
  /**
   * Request log text to observer.
   * Result will be notified via
   * NolTsukumoModelObserverInterface::onLogTextChanged().
   */
  requestLogText() {
    let logText = '';
    if (this.logTextHistory.length) {
      logText = this.logTextHistory.at(-1) as string;
    }
    if (logText) {
      logText += '\n';
    }
    logText += this.getResultString();
    this.logTextHistory.push(logText);
    this.observers.forEach((observer: NolTsukumoModelObserverInterface) => {
      observer.onLogTextChanged(logText);
    });
  }
  /**
   * Clear log text.
   * Result will be notified via
   * NolTsukumoModelObserverInterface::onLogTextChanged().
   */
  clearLogText() {
    if (this.logTextHistory.length) {
      this.logTextHistory.push('');
      this.observers.forEach((observer: NolTsukumoModelObserverInterface) => {
        observer.onLogTextChanged('');
      });
    }
  }
  /**
   * Undo log text change.
   */
  undoLogTextChange() {
    if (this.logTextHistory.length) {
      this.logTextHistory.pop();
      let latestLogText = '';
      if (this.logTextHistory.length) {
        latestLogText = this.logTextHistory.at(-1) as string;
      }
      this.observers.forEach((observer: NolTsukumoModelObserverInterface) => {
        observer.onLogTextChanged(latestLogText);
      });
    }
  }
  /**
   * Register observer of model.
   * @param {NolTsukumoModelObserverInterface} observer - Observer to Register.
   */
  registerObserver(observer: NolTsukumoModelObserverInterface) {
    this.observers.push(observer);
  }
}

/**
 * View of In/Out area on Nol Tsukumo calculator.
 */
class NolTsukumoInOutView implements NolTsukumoModelObserverInterface {
  private currentExpInput: HTMLInputElement = document.getElementById(
    'exp-input',
  ) as HTMLInputElement;
  private toLevelInput: HTMLInputElement = document.getElementById(
    'to-level-input',
  ) as HTMLInputElement;
  private necessaryExpInput: HTMLInputElement = document.getElementById(
    'tsukumo-exp-input',
  ) as HTMLInputElement;
  private necessarySourceInput: HTMLInputElement = document.getElementById(
    'tsukumo-source-input',
  ) as HTMLInputElement;

  /**
   * Initialize instance of view.
   * @param {NolTsukumoModel} model - Instance of model
   */
  initialize(model: NolTsukumoModel) {
    this.currentExpInput = document.getElementById(
      'exp-input',
    ) as HTMLInputElement;
    this.toLevelInput = document.getElementById(
      'to-level-input',
    ) as HTMLInputElement;
    this.necessaryExpInput = document.getElementById(
      'tsukumo-exp-input',
    ) as HTMLInputElement;
    this.necessarySourceInput = document.getElementById(
      'tsukumo-source-input',
    ) as HTMLInputElement;

    model.registerObserver(this);
  }
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated max exp of current level
   */
  onUpdateCurrentExp(exp: number) {
    this.currentExpInput.value = exp.toString();
  }
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(_level: number) {
    return;
  }
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(_maxExp: number) {
    return;
  }
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(toLevel: number) {
    this.toLevelInput.value = toLevel.toString();
  }
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(_toLevelMin: number) {
    return;
  }
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(exp: number, source: number) {
    this.necessaryExpInput.value = exp.toString();
    this.necessarySourceInput.value = source.toString();
  }
  /**
   * Call when log text has been changed.
   * @param {string} logText - Current whole log text.
   */
  onLogTextChanged(_logText: string) {
    return;
  }
}

/**
 * View of log area on Nol Tsukumo calculator.
 */
class NolTsukumoLogView implements NolTsukumoModelObserverInterface {
  private logTextarea: HTMLTextAreaElement = document.getElementById(
    'log-textarea',
  ) as HTMLTextAreaElement;
  /**
   * Scroll log area to bottom.
   */
  scrollLogAreaToBottom() {
    this.logTextarea.scrollTop = this.logTextarea.scrollHeight;
  }

  /**
   * Initialize instance of view.
   * @param {NolTsukumoModel} model - Instance of model
   */
  initialize(model: NolTsukumoModel) {
    this.logTextarea = document.getElementById(
      'log-textarea',
    ) as HTMLTextAreaElement;

    model.registerObserver(this as NolTsukumoModelObserverInterface);
  }
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated current exp
   */
  onUpdateCurrentExp(_exp: number) {
    return;
  }
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(_level: number) {
    return;
  }
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(_maxExp: number) {
    return;
  }
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(_toLevel: number) {
    return;
  }
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(_toLevelMin: number) {
    return;
  }
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(_exp: number, _source: number) {
    return;
  }
  /**
   * Call when log text has been changed.
   * @param {string} logText - Current whole log text.
   */
  onLogTextChanged(logText: string) {
    this.logTextarea.value = logText;
    this.scrollLogAreaToBottom();
  }
}

/**
 * Controller of Nol Tsukumo calculator.
 */
class NolTsukumoController implements NolTsukumoModelObserverInterface {
  private toLevelInput: HTMLInputElement = document.getElementById(
    'to-level-input',
  ) as HTMLInputElement;
  private currentLevelInput: HTMLInputElement = document.getElementById(
    'current-level-input',
  ) as HTMLInputElement;
  private currentExpInput: HTMLInputElement = document.getElementById(
    'exp-input',
  ) as HTMLInputElement;
  private currentNumOfActivatedTsukumo: HTMLSelectElement =
    document.getElementById('active-tsukumo-num-select') as HTMLSelectElement;
  private gainDropdown: HTMLSelectElement = document.getElementById(
    'tsukumo-gain-dropdown',
  ) as HTMLSelectElement;
  private memoButton: HTMLButtonElement = document.getElementById(
    'memo-button',
  ) as HTMLButtonElement;
  private memoClearButton: HTMLButtonElement = document.getElementById(
    'memo-clear-button',
  ) as HTMLButtonElement;
  private memoUndoButton: HTMLButtonElement = document.getElementById(
    'memo-undo-button',
  ) as HTMLButtonElement;

  private model: NolTsukumoModel;

  /**
   * Constructor of NolTsukumoController.
   * @param {NolTsukumoModel} model - Instance of model.
   */
  constructor(model: NolTsukumoModel) {
    this.model = model;
    this.model.registerObserver(this);
  }
  /**
   * Initialize instance of controller.
   */
  initialize() {
    this.toLevelInput = document.getElementById(
      'to-level-input',
    ) as HTMLInputElement;
    this.currentLevelInput = document.getElementById(
      'current-level-input',
    ) as HTMLInputElement;
    this.currentExpInput = document.getElementById(
      'exp-input',
    ) as HTMLInputElement;
    this.currentNumOfActivatedTsukumo = document.getElementById(
      'active-tsukumo-num-select',
    ) as HTMLSelectElement;
    this.gainDropdown = document.getElementById(
      'tsukumo-gain-dropdown',
    ) as HTMLSelectElement;
    this.memoButton = document.getElementById(
      'memo-button',
    ) as HTMLButtonElement;
    this.memoClearButton = document.getElementById(
      'memo-clear-button',
    ) as HTMLButtonElement;
    this.memoUndoButton = document.getElementById(
      'memo-undo-button',
    ) as HTMLButtonElement;

    this.currentLevelInput.addEventListener('input', () => {
      this.model.setCurrentLevel(parseInt(this.currentLevelInput.value, 10));
    });

    this.currentExpInput.addEventListener('input', () => {
      this.model.setCurrentExp(parseInt(this.currentExpInput.value, 10));
    });

    this.currentNumOfActivatedTsukumo.addEventListener('change', () => {
      const numActivated = parseInt(
        this.currentNumOfActivatedTsukumo.value,
        10,
      );
      this.model.setCurrentNumOfActuvatedTsukumo(numActivated);
    });

    this.toLevelInput.addEventListener('input', () => {
      this.model.setToLevel(parseInt(this.toLevelInput.value, 10));
    });

    this.gainDropdown.addEventListener('change', () => {
      const gain = parseFloat(this.gainDropdown.value);
      this.model.setGain(gain);
    });

    this.memoButton.addEventListener('click', () => {
      this.model.requestLogText();
    });

    this.memoClearButton.addEventListener('click', () => {
      this.model.clearLogText();
    });

    this.memoUndoButton.addEventListener('click', () => {
      this.model.undoLogTextChange();
    });
  }
  /**
   * Call when current exp has been updated.
   * @param {number} exp - Updated max exp of current level
   */
  onUpdateCurrentExp(_exp: number) {
    return;
  }
  /**
   * Call when current level has been updated.
   * @param {number} level - Updated current level
   */
  onUpdateCurrentLevel(level: number) {
    this.toLevelInput.min = (level + 1).toString();
  }
  /**
   * Call when max exp of current level has been updated.
   * @param {number} maxExp - Updated max exp of current level
   */
  onUpdateMaxExpOfCurrentLevel(maxExp: number) {
    this.currentExpInput.max = maxExp.toString();
    if (parseInt(this.currentExpInput.value, 10) > maxExp) {
      this.currentExpInput.value = maxExp.toString();
    }
  }
  /**
   * Call when to level has been updated.
   * @param {number} toLevel - Updated "to level"
   */
  onUpdateToLevel(_toLevel: number) {
    return;
  }
  /**
   * Call when min of to level has been updated.
   * @param {number} toLevelMin - Updated min of "to level"
   */
  onUpdateToLevelMin(toLevelMin: number) {
    this.toLevelInput.min = toLevelMin.toString();
  }
  /**
   * Call when necessary tsukumo exp and number of source have been updated.
   * @param {number} exp - Updated exp to specified level.
   * @param {number} source - Updated number of source to specified level.
   */
  onUpdateNecessaryTsukumo(_exp: number, _source: number) {
    return;
  }
  /**
   * Call when log text has been changed.
   * @param {string} logText - Current whole log text.
   */
  onLogTextChanged(_logText: string) {
    return;
  }
}

const gModel = new NolTsukumoModel();
const gInOutView = new NolTsukumoInOutView();
const gLogView = new NolTsukumoLogView();
const gController = new NolTsukumoController(gModel);

window.onload = () => {
  gInOutView.initialize(gModel);
  gLogView.initialize(gModel);
  gController.initialize();
  gModel.initialize();
};
