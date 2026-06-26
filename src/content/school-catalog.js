(function registerSchoolCatalog(global) {
  const catalog = global.SpellingCatalogDomain;
  const wegorSchool = global.SpellingWegorSchool;
  const princetonSchool = global.SpellingPrincetonSchool;

  global.SpellingSchoolCatalog = catalog.createSchoolCatalog(
    [wegorSchool, princetonSchool],
    "wegor"
  );

  global.SpellingLevelCatalog = princetonSchool;
})(window);
