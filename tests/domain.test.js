const assert = require("node:assert/strict");
const test = require("node:test");

function loadDomain() {
  global.window = global;
  delete global.SpellingLevelLabels;
  delete global.SpellingQuizSession;

  [
    "../src/domain/level-labels.js",
    "../src/domain/quiz-session.js"
  ].forEach(function loadModule(modulePath) {
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
  });
}

test("level labels are formatted for the current Traditional Chinese UI", function verifyLevelLabels() {
  loadDomain();

  assert.equal(global.SpellingLevelLabels.displayLevelLabel({ label: "Level 3.1" }), "第 3.1 級");
  assert.equal(global.SpellingLevelLabels.displayLevelLabel({ label: "Grade 2" }), "第 2 年級");
  assert.equal(global.SpellingLevelLabels.displayLevelLabel({ label: "Challenge" }), "Challenge");
});

test("quiz answer checks ignore casing and repeated spaces", function verifyAnswerNormalization() {
  loadDomain();

  assert.equal(global.SpellingQuizSession.normalizeAnswer("  Dining   Room  "), "dining room");
  assert.equal(global.SpellingQuizSession.isCorrectAnswer("DINING   ROOM", "dining room"), true);
  assert.equal(global.SpellingQuizSession.isCorrectAnswer("dinning room", "dining room"), false);
});

test("quiz scoring helpers handle early exits and duplicate wrong words", function verifyScoring() {
  loadDomain();

  assert.equal(global.SpellingQuizSession.percentCorrect(0, 0), 0);
  assert.equal(global.SpellingQuizSession.percentCorrect(1, 3), 33);
  assert.deepEqual(global.SpellingQuizSession.uniqueWords(["a", "b", "a"]), ["a", "b"]);
});
