(function registerApp(global) {
  const catalog = global.SpellingLevelCatalog;
  const storage = global.SpellingStorage;
  const speech = global.SpellingSpeech;

  const state = {
    activeView: "entry",
    activity: "testing",
    quiz: [],
    index: 0,
    correct: 0,
    wrongWords: [],
    hasPlayed: false,
    hasAnswered: false
  };

  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    renderLevelOptions();
    bindEvents();
    renderStartStats();
    updateRateLabel();
    showView("entry");
  }

  function cacheElements() {
    const ids = [
      "entryView","setupView","quizView","practiceView","resultsView",
      "chooseTestingBtn","choosePracticeBtn","backToEntryBtn","practiceBackBtn",
      "activityLabel","modeSelect","testingControls","quizLimitGroup",
      "shuffleToggle","autoSpeakToggle","quizLimit","speechRate","rateValue",
      "startBtn","resetHistoryBtn","totalWordCount","lastScore","missedCount",
      "modeLabel","progressText","correctCount","wrongCount","progressFill",
      "speakBtn","hintBtn","skipBtn","feedback","answerInput","checkBtn","nextBtn",
      "practiceLevelLabel","libraryCount","wordSearch","wordLibrary",
      "resultScore","resultMessage","wrongWordsBlock","wrongWordsList",
      "retryWrongBtn","homeBtn","exitQuizBtn","practiceHomeBtn"
    ];

    ids.forEach(function assignElement(id) {
      elements[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    elements.chooseTestingBtn.addEventListener("click", function chooseTesting() {
      chooseActivity("testing");
    });
    elements.choosePracticeBtn.addEventListener("click", function choosePractice() {
      chooseActivity("practice");
    });
    elements.backToEntryBtn.addEventListener("click", returnHome);
    elements.practiceBackBtn.addEventListener("click", function returnToPracticeSetup() {
      showView("setup");
    });
    elements.startBtn.addEventListener("click", startSelectedActivity);
    elements.resetHistoryBtn.addEventListener("click", resetHistory);
    elements.speechRate.addEventListener("input", updateRateLabel);
    elements.speakBtn.addEventListener("click", speakCurrentWord);
    elements.hintBtn.addEventListener("click", showHint);
    elements.skipBtn.addEventListener("click", skipWord);
    elements.checkBtn.addEventListener("click", checkAnswer);
    elements.nextBtn.addEventListener("click", nextWord);
    elements.exitQuizBtn.addEventListener("click", exitQuiz);
    elements.retryWrongBtn.addEventListener("click", retryWrongWords);
    elements.homeBtn.addEventListener("click", returnHome);
    elements.practiceHomeBtn.addEventListener("click", returnHome);
    elements.wordSearch.addEventListener("input", renderPracticeLibrary);
    elements.answerInput.addEventListener("keydown", function submitOnEnter(event) {
      if (event.key === "Enter") {
        if (state.hasAnswered) {
          nextWord();
        } else {
          checkAnswer();
        }
      }
    });
  }

  function chooseActivity(activity) {
    state.activity = activity;
    elements.activityLabel.textContent = activity === "testing" ? "測驗模式" : "練習模式";
    elements.startBtn.textContent = activity === "testing" ? "開始測驗" : "開始練習";
    elements.testingControls.classList.toggle("hidden", activity !== "testing");
    elements.quizLimitGroup.classList.toggle("hidden", activity !== "testing");
    showView("setup");
  }

  function startSelectedActivity() {
    if (state.activity === "practice") {
      startPractice(elements.modeSelect.value);
      return;
    }
    startQuiz(elements.modeSelect.value);
  }

  function allWords() {
    return catalog.allWords;
  }

  function getWordsByMode(mode) {
    if (mode === "missed") {
      const missed = storage.getMissedWords();
      return allWords().filter(function isMissed(entry) {
        return isMissedEntry(entry, missed);
      });
    }
    const level = catalog.levelsById[mode] || catalog.allLevel;
    return level.words;
  }

  function startQuiz(mode) {
    let selectedWords = getWordsByMode(mode);
    if (selectedWords.length === 0) {
      showStartMessage("目前沒有可重練的錯字。先完成一次測驗吧。");
      return;
    }

    if (elements.shuffleToggle.checked) {
      selectedWords = shuffle(selectedWords);
    }

    const limit = elements.quizLimit.value;
    if (limit !== "all") {
      selectedWords = selectedWords.slice(0, Number(limit));
    }

    state.quiz = selectedWords;
    state.index = 0;
    state.correct = 0;
    state.wrongWords = [];
    elements.modeLabel.textContent = modeLabel(mode);
    showView("quiz");
    loadCurrentWord();
  }

  function startPractice(mode) {
    const selectedWords = getWordsByMode(mode);
    if (selectedWords.length === 0) {
      showStartMessage("目前沒有可練習的錯字。先完成一次測驗吧。");
      return;
    }

    state.practiceWords = selectedWords;
    elements.practiceLevelLabel.textContent = modeLabel(mode);
    elements.wordSearch.value = "";
    renderPracticeLibrary();
    showView("practice");
  }

  function loadCurrentWord() {
    state.hasPlayed = false;
    state.hasAnswered = false;
    elements.answerInput.value = "";
    elements.answerInput.disabled = false;
    elements.answerInput.className = "";
    elements.feedback.textContent = "";
    elements.feedback.className = "feedback";
    elements.hintBtn.disabled = false;
    elements.checkBtn.classList.remove("hidden");
    elements.nextBtn.classList.add("hidden");
    updateProgress();
    elements.answerInput.focus();

    if (elements.autoSpeakToggle.checked) {
      window.setTimeout(speakCurrentWord, 250);
    }
  }

  function speakCurrentWord() {
    const entry = state.quiz[state.index];
    if (!entry) {
      return;
    }

    const canSpeak = speech.speakWord(entry.word, elements.speechRate.value);
    state.hasPlayed = canSpeak;
    if (!canSpeak) {
      showFeedback("這個瀏覽器不支援語音播放。", "bad");
    }
    elements.answerInput.focus();
  }

  function showHint() {
    const entry = state.quiz[state.index];
    elements.feedback.textContent = "提示：" + entry.word[0].toUpperCase() + " _ ".repeat(Math.max(entry.word.length - 1, 0));
    elements.feedback.className = "feedback hint";
    elements.hintBtn.disabled = true;
  }

  function skipWord() {
    const entry = state.quiz[state.index];
    state.wrongWords.push(entry.id);
    revealAnswer("已跳過。正確答案：" + entry.word, false);
  }

  function checkAnswer() {
    const entry = state.quiz[state.index];
    const answer = normalizeAnswer(elements.answerInput.value);
    if (!answer) {
      elements.answerInput.focus();
      return;
    }
    if (!state.hasPlayed && elements.autoSpeakToggle.checked) {
      showFeedback("請先聽單字再作答。", "bad");
      return;
    }

    const isCorrect = answer === normalizeAnswer(entry.word);
    if (isCorrect) {
      state.correct += 1;
      revealAnswer("答對了。", true);
    } else {
      state.wrongWords.push(entry.id);
      revealAnswer("答錯了。正確答案：" + entry.word, false);
      window.setTimeout(function repeatMissedWord() {
        speech.speakWord(entry.word, Math.max(Number(elements.speechRate.value) - 0.08, 0.55));
      }, 350);
    }
  }

  function revealAnswer(message, isCorrect) {
    state.hasAnswered = true;
    elements.answerInput.disabled = true;
    elements.answerInput.className = isCorrect ? "correct" : "incorrect";
    showFeedback(message, isCorrect ? "good" : "bad");
    elements.hintBtn.disabled = true;
    elements.checkBtn.classList.add("hidden");
    elements.nextBtn.textContent = state.index + 1 >= state.quiz.length ? "查看結果" : "下一題";
    elements.nextBtn.classList.remove("hidden");
    updateProgress();
  }

  function nextWord() {
    if (!state.hasAnswered) {
      return;
    }

    if (state.index + 1 >= state.quiz.length) {
      showResults();
      return;
    }

    state.index += 1;
    loadCurrentWord();
  }

  function showResults() {
    concludeQuiz(state.quiz.length);
  }

  function concludeQuiz(total) {
    const percent = total > 0 ? Math.round((state.correct / total) * 100) : 0;
    const uniqueWrongWordIds = uniqueWords(state.wrongWords);
    if (total > 0) {
      storage.saveSession({
        date: new Date().toISOString(),
        total: total,
        correct: state.correct,
        percent: percent,
        wrongWords: uniqueWrongWordIds
      });
    }

    elements.resultScore.textContent = state.correct + " / " + total + " (" + percent + "%)";
    elements.resultMessage.textContent = total > 0 ? resultMessage(percent) : "尚未作答，沒有儲存成績。";
    renderWrongWords(uniqueWrongWordIds);
    showView("results");
    renderStartStats();
  }

  function renderWrongWords(wrongWordIds) {
    const wrongEntries = entriesByIds(wrongWordIds);
    elements.wrongWordsBlock.classList.toggle("hidden", wrongEntries.length === 0);
    elements.wrongWordsList.replaceChildren();
    wrongEntries.forEach(function renderWord(entry) {
      elements.wrongWordsList.appendChild(createWordItem(entry));
    });
  }

  function retryWrongWords() {
    const missed = storage.getMissedWords();
    state.quiz = allWords().filter(function isMissed(entry) {
      return isMissedEntry(entry, missed);
    });
    if (elements.shuffleToggle.checked) {
      state.quiz = shuffle(state.quiz);
    }
    state.index = 0;
    state.correct = 0;
    state.wrongWords = [];
    elements.modeLabel.textContent = "重練錯字";
    showView("quiz");
    loadCurrentWord();
  }

  function exitQuiz() {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    const answeredCount = state.index + (state.hasAnswered ? 1 : 0);
    concludeQuiz(answeredCount);
  }

  function returnHome() {
    showView("entry");
    renderStartStats();
  }

  function renderStartStats() {
    const history = storage.getHistory();
    const missed = storage.getMissedWords();
    elements.totalWordCount.textContent = String(allWords().length);
    elements.lastScore.textContent = history.length > 0 ? history[0].percent + "%" : "--";
    elements.missedCount.textContent = String(missed.length);
  }

  function renderLevelOptions() {
    elements.modeSelect.replaceChildren();
    elements.modeSelect.appendChild(createOption("all", "全部等級（" + allWords().length + "）"));
    catalog.levels.forEach(function appendLevelOption(level) {
      elements.modeSelect.appendChild(createOption(level.id, displayLevelLabel(level) + "（" + level.words.length + "）"));
    });
    elements.modeSelect.appendChild(createOption("missed", "上次答錯"));
  }

  function renderPracticeLibrary() {
    const query = elements.wordSearch.value.trim().toLowerCase();
    let entries = state.practiceWords || getWordsByMode(elements.modeSelect.value);

    if (query) {
      entries = entries.filter(function matchesQuery(entry) {
        return entry.word.toLowerCase().includes(query)
          || (entry.definition || "").toLowerCase().includes(query);
      });
    }

    elements.libraryCount.textContent = String(entries.length);
    elements.wordLibrary.replaceChildren();
    entries.forEach(function appendEntry(entry) {
      elements.wordLibrary.appendChild(createWordItem(entry));
    });
  }

  function createWordItem(entry) {
    const item = document.createElement("li");
    const textBlock = document.createElement("span");
    const wordText = document.createElement("strong");
    const detailText = document.createElement("em");
    const button = document.createElement("button");
    const level = catalog.levelsById[entry.levelId];

    wordText.textContent = entry.word;
    detailText.textContent = wordDetail(entry, level);
    textBlock.append(wordText, detailText);
    button.type = "button";
    button.textContent = "Listen";
    button.className = "word-audio";
    button.addEventListener("click", function speakItem() {
      speech.speakWord(entry.word, elements.speechRate.value);
    });

    if (level) {
      const badge = document.createElement("small");
      badge.textContent = displayLevelLabel(level);
      item.append(textBlock, badge, button);
    } else {
      item.append(textBlock, button);
    }

    return item;
  }

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function updateProgress() {
    const total = state.quiz.length;
    const current = Math.min(state.index + 1, total);
    const answeredCount = state.index + (state.hasAnswered ? 1 : 0);
    elements.progressText.textContent = "第 " + current + " 題 / 共 " + total + " 題";
    elements.progressFill.style.width = String((answeredCount / total) * 100) + "%";
    elements.correctCount.textContent = String(state.correct);
    elements.wrongCount.textContent = String(state.wrongWords.length);
  }

  function updateRateLabel() {
    elements.rateValue.textContent = Number(elements.speechRate.value).toFixed(2) + "x";
  }

  function resetHistory() {
    storage.clearAll();
    renderStartStats();
    showStartMessage("紀錄已清除。");
  }

  function showStartMessage(message) {
    const originalText = elements.startBtn.textContent;
    elements.startBtn.textContent = message;
    window.setTimeout(function restoreText() {
      elements.startBtn.textContent = originalText;
    }, 1800);
  }

  function showFeedback(message, type) {
    elements.feedback.textContent = message;
    elements.feedback.className = "feedback " + type;
  }

  function showView(view) {
    state.activeView = view;
    elements.entryView.classList.toggle("hidden", view !== "entry");
    elements.setupView.classList.toggle("hidden", view !== "setup");
    elements.quizView.classList.toggle("hidden", view !== "quiz");
    elements.practiceView.classList.toggle("hidden", view !== "practice");
    elements.resultsView.classList.toggle("hidden", view !== "results");
  }

  function shuffle(entries) {
    const shuffled = entries.slice();
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = shuffled[index];
      shuffled[index] = shuffled[swapIndex];
      shuffled[swapIndex] = current;
    }
    return shuffled;
  }

  function normalizeAnswer(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function uniqueWords(wordList) {
    return Array.from(new Set(wordList));
  }

  function modeLabel(mode) {
    if (mode === "missed") {
      return "上次答錯";
    }
    const level = catalog.levelsById[mode] || catalog.allLevel;
    return level.id === "all" ? "全部等級" : displayLevelLabel(level);
  }

  function displayLevelLabel(level) {
    return level.label.replace("Level", "第") + " 級";
  }

  function entriesByIds(ids) {
    const idSet = new Set(ids);
    return allWords().filter(function hasId(entry) {
      return idSet.has(entry.id) || idSet.has(entry.word);
    });
  }

  function isMissedEntry(entry, missed) {
    return missed.includes(entry.id) || missed.includes(entry.word);
  }

  function wordDetail(entry, level) {
    const parts = [];
    if (entry.partOfSpeech) {
      parts.push(entry.partOfSpeech);
    }
    if (entry.definition) {
      parts.push(entry.definition);
    }
    if (!entry.definition && level) {
      parts.push(level.subtitle);
    }
    return parts.join(" - ");
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
})(window);
