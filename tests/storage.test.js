const assert = require("node:assert/strict");
const test = require("node:test");

function createLocalStorageMock() {
  const store = new Map();
  return {
    getItem: function getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem: function setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem: function removeItem(key) {
      store.delete(key);
    }
  };
}

function loadStorage() {
  global.window = global;
  global.localStorage = createLocalStorageMock();
  delete global.SpellingStorage;
  delete require.cache[require.resolve("../src/storage/progress-storage.js")];
  require("../src/storage/progress-storage.js");
  return global.SpellingStorage;
}

test("storage starts empty and saves the latest session first", function verifySaveSession() {
  const storage = loadStorage();

  assert.deepEqual(storage.getHistory(), []);
  assert.deepEqual(storage.getMissedWords(), []);

  storage.saveSession({
    schoolId: "wegor",
    total: 2,
    correct: 1,
    percent: 50,
    wrongWords: ["wegor-grade-2-about"]
  });

  assert.equal(storage.getHistory().length, 1);
  assert.equal(storage.getHistory()[0].schoolId, "wegor");
  assert.deepEqual(storage.getMissedWords(), ["wegor-grade-2-about"]);
});

test("storage keeps only the newest twenty sessions", function verifyHistoryLimit() {
  const storage = loadStorage();

  for (let index = 0; index < 25; index += 1) {
    storage.saveSession({
      schoolId: "princeton",
      total: 1,
      correct: 1,
      percent: index,
      wrongWords: []
    });
  }

  const history = storage.getHistory();
  assert.equal(history.length, 20);
  assert.equal(history[0].percent, 24);
  assert.equal(history[history.length - 1].percent, 5);
});

test("storage clearAll removes history and missed words", function verifyClearAll() {
  const storage = loadStorage();

  storage.saveSession({
    schoolId: "wegor",
    total: 1,
    correct: 0,
    percent: 0,
    wrongWords: ["wegor-grade-2-action"]
  });
  storage.clearAll();

  assert.deepEqual(storage.getHistory(), []);
  assert.deepEqual(storage.getMissedWords(), []);
});
