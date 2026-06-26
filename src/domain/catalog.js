(function registerCatalogDomain(global) {
  function createLevel(id, label, subtitle, source, words, schoolId) {
    return Object.freeze({
      id: id,
      label: label,
      subtitle: subtitle,
      source: source,
      schoolId: schoolId,
      words: Object.freeze(toEntries(words, id, schoolId))
    });
  }

  function toEntries(words, levelId, schoolId) {
    return words.map(function mapWord(entry) {
      const word = typeof entry === "string" ? entry : entry.word;
      const normalizedEntry = {
        id: levelId + "-" + word.toLowerCase().replace(/\s+/g, "-"),
        word: word,
        levelId: levelId,
        schoolId: schoolId
      };
      if (entry.partOfSpeech) {
        normalizedEntry.partOfSpeech = entry.partOfSpeech;
      }
      if (entry.definition) {
        normalizedEntry.definition = entry.definition;
      }
      return Object.freeze(normalizedEntry);
    });
  }

  function createAllLevel(levels) {
    return Object.freeze({
      id: "all",
      label: "All Levels",
      subtitle: "全部單字",
      source: "Combined catalog",
      schoolId: levels[0] ? levels[0].schoolId : "",
      words: Object.freeze(levels.flatMap(function flattenLevel(level) {
        return level.words;
      }))
    });
  }

  function createSchool(id, label, levels, metadata) {
    const allLevel = createAllLevel(levels);
    const levelsById = levels.reduce(function indexLevel(result, level) {
      result[level.id] = level;
      return result;
    }, { all: allLevel });
    const schoolMetadata = metadata || {};

    return Object.freeze({
      id: id,
      label: label,
      logoSrc: schoolMetadata.logoSrc || "",
      shortLabel: schoolMetadata.shortLabel || label.charAt(0),
      levels: Object.freeze(levels),
      levelsById: Object.freeze(levelsById),
      allLevel: allLevel,
      allWords: allLevel.words
    });
  }

  function createSchoolCatalog(schools, defaultSchoolId) {
    const schoolsById = schools.reduce(function indexSchool(result, school) {
      result[school.id] = school;
      return result;
    }, {});

    return Object.freeze({
      schools: Object.freeze(schools),
      schoolsById: Object.freeze(schoolsById),
      defaultSchoolId: defaultSchoolId
    });
  }

  function getSchool(catalog, schoolId) {
    return catalog.schoolsById[schoolId] || catalog.schoolsById[catalog.defaultSchoolId];
  }

  function getWordsByMode(school, mode, missedWords) {
    if (mode === "missed") {
      return school.allWords.filter(function isMissed(entry) {
        return isMissedEntry(entry, missedWords);
      });
    }
    const level = school.levelsById[mode] || school.allLevel;
    return level.words;
  }

  function findLevelForEntry(catalog, entry, fallbackSchool) {
    const school = catalog.schoolsById[entry.schoolId] || fallbackSchool;
    return school.levelsById[entry.levelId] || null;
  }

  function entriesByIds(school, ids) {
    const idSet = new Set(ids);
    return school.allWords.filter(function hasId(entry) {
      return idSet.has(entry.id) || idSet.has(entry.word);
    });
  }

  function isMissedEntry(entry, missedWords) {
    return missedWords.includes(entry.id) || missedWords.includes(entry.word);
  }

  global.SpellingCatalogDomain = Object.freeze({
    createLevel: createLevel,
    createSchool: createSchool,
    createSchoolCatalog: createSchoolCatalog,
    getSchool: getSchool,
    getWordsByMode: getWordsByMode,
    findLevelForEntry: findLevelForEntry,
    entriesByIds: entriesByIds,
    isMissedEntry: isMissedEntry,
    toEntries: toEntries
  });
})(window);
