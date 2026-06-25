(function registerSpeech(global) {
  function speakWord(word, rate) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      return false;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = Number(rate);
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
    return true;
  }

  global.SpellingSpeech = Object.freeze({
    speakWord: speakWord
  });
})(window);
