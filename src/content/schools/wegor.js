(function registerWegorSchool(global) {
  const catalog = global.SpellingCatalogDomain;

  const levels = (global.SpellingWegorLevels || []).map(function normalizeWegorLevel(level) {
    return catalog.createLevel(level.id, level.label, level.subtitle, level.source, level.words, "wegor");
  });

  global.SpellingWegorSchool = catalog.createSchool("wegor", "葳格", levels);
})(window);
