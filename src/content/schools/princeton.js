(function registerPrincetonSchool(global) {
  const catalog = global.SpellingCatalogDomain;
  const manualLevelTwo = global.SpellingPrincetonLevelTwoWords;

  const levelTwo = catalog.createLevel(
    "level-2",
    "Level 2",
    "二年級萬字王",
    "Spelling_Bee_Level2.html",
    manualLevelTwo.all,
    "princeton"
  );

  const generatedLevels = (global.SpellingPdfLevels || []).map(function normalizePdfLevel(level) {
    return catalog.createLevel(level.id, level.label, level.subtitle, level.source, level.words, "princeton");
  });

  const levels = [generatedLevels[0], levelTwo].concat(generatedLevels.slice(1)).filter(Boolean);

  global.SpellingPrincetonSchool = catalog.createSchool("princeton", "普林斯頓", levels);

  global.SpellingWords = Object.freeze({
    easy: Object.freeze(catalog.toEntries(manualLevelTwo.easy, "level-2-basic", "princeton")),
    hard: Object.freeze(catalog.toEntries(manualLevelTwo.hard, "level-2-challenge", "princeton"))
  });
})(window);
