(function registerWords(global) {
  const easyWords = [
    "always","also","ambulance","already","alone","anyone","anything","April",
    "August","answer","away","angel","act","attention",
    "baseball","backpack","basketball","bathroom","birthday","butterfly","blackboard","believe","beware","busy",
    "clap","circle","city","clear","chance","chalk","careful","cold","chicken","crayon","cloud","chocolate","crown","curious","curly",
    "December","dinner","dining room","dentist","dinosaur","desert","dolphin","dragon","drum","difficult","decide","disgusting",
    "earth","Easter","example","eye","everyone","eraser","evening","enjoy","enough","enormous","equal",
    "Friday","friend","family","frog","fruit","foot","furious",
    "garbage","gold","glass","glove","gather","grow","guard",
    "ham","hamburger","hand","handsome","help","husband","heal","hour",
    "important","insect","island","imitate","impossible",
    "jeans","jog","join","joke",
    "king","kite","knife","koala","knock",
    "lemon","line","loud","lock","letter",
    "March","map","magic","market","mask","maybe","movie","Monday","millions","museum",
    "night","nervous","noise","newspaper","nod",
    "office","order","outside","only","onion",
    "page","pet","photo","peach","pie","playground","party","police","present","picnic","problem",
    "question","quiet","quick",
    "remember","rock","rainy","rice","rich","rose","rush","rotten",
    "sleep","safe","say","sing","swim","sweater","shark","scream","straight",
    "telephone","table","today","three","trash","trouble","tough",
    "uncle","umbrella",
    "violin","vegetable","visit",
    "waiter","winter","whale","watch","wonderful","Wednesday","weather","weak","wrap",
    "yard","young","yesterday"
  ];

  const hardWords = [
    "barbecue","guava","rabbit","cockroach","spider",
    "between","America","dictionary","surprise","direction",
    "popular","wrong","favorite","mountain","mistake",
    "welcome","interesting","strawberry","badminton","terrible",
    "Frisbee","excellent","different","season","special",
    "finally","humor","forgive","remarkable","public",
    "sentence","thief","Internet","festival","castle",
    "childhood","memory","listen","prepare","float",
    "pleasure","computer","happen","promise","friendship",
    "dangerous","kindergarten","stomach","toilet","treasure"
  ];

  const levelTwoWords = easyWords.concat(hardWords);

  function createLevel(id, label, subtitle, source, words) {
    return Object.freeze({
      id: id,
      label: label,
      subtitle: subtitle,
      source: source,
      words: Object.freeze(toEntries(words, id))
    });
  }

  function toEntries(words, levelId) {
    return words.map(function mapWord(entry) {
      const word = typeof entry === "string" ? entry : entry.word;
      const normalizedEntry = {
        id: levelId + "-" + word.toLowerCase().replace(/\s+/g, "-"),
        word: word,
        levelId: levelId
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
      words: Object.freeze(levels.flatMap(function flattenLevel(level) {
        return level.words;
      }))
    });
  }

  const levelTwo = createLevel(
    "level-2",
    "Level 2",
    "二年級萬字王",
    "Spelling_Bee_Level2.html",
    levelTwoWords
  );

  const pdfLevels = (global.SpellingPdfLevels || []).map(function normalizePdfLevel(level) {
    return createLevel(level.id, level.label, level.subtitle, level.source, level.words);
  });

  const orderedLevels = Object.freeze([pdfLevels[0], levelTwo].concat(pdfLevels.slice(1)).filter(Boolean));
  const allLevel = createAllLevel(orderedLevels);
  const levelsById = orderedLevels.reduce(function indexLevel(result, level) {
    result[level.id] = level;
    return result;
  }, { all: allLevel });

  global.SpellingLevelCatalog = Object.freeze({
    levels: orderedLevels,
    levelsById: Object.freeze(levelsById),
    allLevel: allLevel,
    allWords: allLevel.words
  });

  global.SpellingWords = Object.freeze({
    easy: Object.freeze(toEntries(easyWords, "level-2-basic")),
    hard: Object.freeze(toEntries(hardWords, "level-2-challenge"))
  });
})(window);
