(function registerQuizSessionDomain(global) {
  function normalizeAnswer(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function isCorrectAnswer(answer, word) {
    return normalizeAnswer(answer) === normalizeAnswer(word);
  }

  function uniqueWords(wordList) {
    return Array.from(new Set(wordList));
  }

  function percentCorrect(correct, total) {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  function resultMessage(percent) {
    if (percent >= 90) {
      return "太棒了，已經很穩。";
    }
    if (percent >= 70) {
      return "很不錯，再練幾個錯字就更完整。";
    }
    if (percent >= 50) {
      return "有基礎了，建議先重練答錯單字。";
    }
    return "先慢慢練聽音和首字母，不急。";
  }

  global.SpellingQuizSession = Object.freeze({
    normalizeAnswer: normalizeAnswer,
    isCorrectAnswer: isCorrectAnswer,
    uniqueWords: uniqueWords,
    percentCorrect: percentCorrect,
    resultMessage: resultMessage
  });
})(window);
