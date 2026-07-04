import { evaluateSpeech } from "./services/speech/evaluateSpeechService";

console.log(
  evaluateSpeech({
    transcript: "cow",
    expectedAnswers: ["cow"],
    acceptedVariations: [],
  })
);

console.log(
  evaluateSpeech({
    transcript: "caw",
    expectedAnswers: ["cow"],
    acceptedVariations: ["caw"],
  })
);

console.log(
  evaluateSpeech({
    transcript: "co",
    expectedAnswers: ["cow"],
    acceptedVariations: [],
  })
);
console.log(
  evaluateSpeech({
    transcript: "awww",
    expectedAnswers: ["cow"],
    acceptedVariations: [],
  })
);

console.log(
  evaluateSpeech({
    transcript: "wow",
    expectedAnswers: ["cow"],
    acceptedVariations: [],
  })
);

console.log(
  evaluateSpeech({
    transcript: "banana",
    expectedAnswers: ["cow"],
    acceptedVariations: [],
  })
);