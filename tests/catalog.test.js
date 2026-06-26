const assert = require("node:assert/strict");
const test = require("node:test");

function loadCatalog() {
  global.window = global;
  delete global.SpellingPdfLevels;
  delete global.SpellingWegorLevels;
  delete global.SpellingCatalogDomain;
  delete global.SpellingPrincetonLevelTwoWords;
  delete global.SpellingPrincetonSchool;
  delete global.SpellingWegorSchool;
  delete global.SpellingSchoolCatalog;
  delete global.SpellingLevelCatalog;
  delete global.SpellingWords;

  [
    "../src/domain/catalog.js",
    "../src/content/generated/princeton-levels.generated.js",
    "../src/content/generated/wegor-levels.generated.js",
    "../src/content/manual/princeton-level-2.js",
    "../src/content/schools/princeton.js",
    "../src/content/schools/wegor.js",
    "../src/content/school-catalog.js"
  ].forEach(function clearModule(modulePath) {
    delete require.cache[require.resolve(modulePath)];
    require(modulePath);
  });

  return global.SpellingSchoolCatalog;
}

test("catalog exposes the supported schools in the expected order", function verifySchoolList() {
  const catalog = loadCatalog();

  assert.deepEqual(
    catalog.schools.map(function schoolLabel(school) {
      return school.label;
    }),
    ["葳格", "普林斯頓"]
  );
  assert.equal(catalog.defaultSchoolId, "wegor");
});

test("school catalogs keep their word counts and level counts separate", function verifyCounts() {
  const catalog = loadCatalog();
  const wegor = catalog.schoolsById.wegor;
  const princeton = catalog.schoolsById.princeton;

  assert.equal(wegor.allWords.length, 250);
  assert.equal(wegor.levels.length, 1);
  assert.equal(wegor.levels[0].label, "Grade 2");
  assert.equal(wegor.levels[0].words.length, 250);

  assert.equal(princeton.allWords.length, 1886);
  assert.equal(princeton.levels.length, 9);
  assert.equal(princeton.levelsById["level-2"].words.length, 228);
});

test("word entries are tagged with their owning school", function verifySchoolIds() {
  const catalog = loadCatalog();

  catalog.schools.forEach(function verifySchoolWords(school) {
    school.allWords.forEach(function verifyWord(entry) {
      assert.equal(entry.schoolId, school.id);
      assert.ok(school.levelsById[entry.levelId], "missing level " + entry.levelId);
    });
  });
});

test("generated Wegor words preserve the extracted PDF order", function verifyWegorOrder() {
  const catalog = loadCatalog();
  const words = catalog.schoolsById.wegor.allWords;

  assert.equal(words[0].word, "action");
  assert.equal(words[words.length - 1].word, "amphibian");
});

test("legacy Princeton catalog remains available for older code paths", function verifyLegacyCatalog() {
  loadCatalog();

  assert.equal(global.SpellingLevelCatalog.id, "princeton");
  assert.equal(global.SpellingLevelCatalog.allWords.length, 1886);
});
