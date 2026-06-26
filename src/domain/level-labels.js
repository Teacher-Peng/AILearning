(function registerLevelLabels(global) {
  function displayLevelLabel(level) {
    if (level.label.indexOf("Level") === 0) {
      return level.label.replace("Level", "第") + " 級";
    }
    if (level.label.indexOf("Grade") === 0) {
      return level.label.replace("Grade", "第") + " 年級";
    }
    return level.label;
  }

  global.SpellingLevelLabels = Object.freeze({
    displayLevelLabel: displayLevelLabel
  });
})(window);
