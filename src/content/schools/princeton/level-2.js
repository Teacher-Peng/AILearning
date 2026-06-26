(function registerPrincetonLevelTwo(global) {
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

  global.SpellingPrincetonLevelTwoWords = Object.freeze({
    easy: Object.freeze(easyWords),
    hard: Object.freeze(hardWords),
    all: Object.freeze(easyWords.concat(hardWords))
  });
})(window);
