(function registerStorage(global) {
  const historyKey = "spellingBeeLevel2.history";
  const missedKey = "spellingBeeLevel2.missedWords";

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getHistory() {
    return readJson(historyKey, []);
  }

  function getMissedWords() {
    return readJson(missedKey, []);
  }

  function saveSession(session) {
    const history = getHistory();
    history.unshift(session);
    writeJson(historyKey, history.slice(0, 20));
    writeJson(missedKey, session.wrongWords);
  }

  function clearAll() {
    localStorage.removeItem(historyKey);
    localStorage.removeItem(missedKey);
  }

  global.SpellingStorage = Object.freeze({
    getHistory: getHistory,
    getMissedWords: getMissedWords,
    saveSession: saveSession,
    clearAll: clearAll
  });
})(window);
