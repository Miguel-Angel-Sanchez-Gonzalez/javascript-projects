import { words as INITIAL_WORDS } from "./data.js";
const $time = document.querySelector("time");
const $paragraph = document.querySelector("p");
const $input = document.querySelector("input");
const $game = document.querySelector("#game");
const $results = document.querySelector("#results");
const $wpm = document.querySelector("#wpm");
const $accuracy = document.querySelector("#accuracy");
const $restart = document.querySelector("#restart");

const INITIAL_TIME = 30;
let intervalId;
let words = [];
let currentTime = INITIAL_TIME;

initGame();
initEvents();

function initGame() {
  clearInterval(intervalId);

  $input.value = "";
  words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5)
    .map((word) => word.toLowerCase().trim())
    .slice(0, 55);

  currentTime = INITIAL_TIME;
  $time.textContent = currentTime;

  $paragraph.innerHTML = words
    .map((word, index) => {
      const letters = word.split("");

      return `<x-word>
        ${letters.map((letter) => `<x-letter>${letter}</x-letter>`).join("")}
      </x-word>
      `;
    })
    .join("");

  const $firstWord = $paragraph.querySelector("x-word");
  $firstWord.classList.add("active");
  $firstWord.querySelector("x-letter").classList.add("active");

  intervalId = setInterval(() => {
    currentTime--;
    $time.textContent = currentTime;

    if (currentTime === 0) {
      clearInterval(intervalId);
      gameOver();
    }
  }, 1000);
}

function initEvents() {
  document.addEventListener("keydown", () => {
    $input.focus();
  });

  $input.addEventListener("keydown", onKeyDown);
  $input.addEventListener("input", onKeyUp);

  $restart.addEventListener("click", () => {
    $results.style.display = "none";
    $game.style.display = "flex";
    initGame();
  });
}

function onKeyDown(event) {
  const $currentWord = $paragraph.querySelector("x-word.active");
  const $currentLetter = $currentWord.querySelector("x-letter.active");

  const { key } = event;
  if (key === " ") {
    event.preventDefault();

    const $nextWord = $currentWord.nextElementSibling;
    const $nextLetter = $nextWord.querySelector("x-letter");

    $currentWord.classList.remove("active", "marked");
    $nextWord.classList.add("active");

    $currentLetter.classList.remove("active");
    $nextLetter.classList.add("active");

    $input.value = "";

    const hasMissedLetters =
      $currentWord.querySelectorAll("x-letter:not(.correct)").length > 0;

    const classToAdd = hasMissedLetters ? "marked" : "correct";
    $currentWord.classList.add(classToAdd);
    return;
  }

  if (key === "Backspace") {
    const $prevWord = $currentWord.previousElementSibling;
    const $prevLetter = $currentLetter.previousElementSibling;

    if (!$prevWord && !$prevLetter) {
      event.preventDefault();
      return;
    }

    const $wordMarked = $paragraph.querySelector("x-word.marked");
    if ($wordMarked && !$prevLetter) {
      event.preventDefault();
      $prevWord.classList.remove("marked");
      $prevWord.classList.add("active");

      const $letterToGo = $prevWord.querySelector("x-letter:last-child");

      $currentLetter.classList.remove("active");
      $letterToGo.classList.add("active");

      $input.value = [
        ...$prevWord.querySelectorAll("x-letter.correct, x-letter.incorrect"),
      ]
        .map(($el) => {
          return $el.classList.contains("correct") ? $el.innerText : "*";
        })
        .join("");
    }
  }
}

function onKeyUp() {
  const $currentWord = $paragraph.querySelector("x-word.active");
  const $currentLetter = $currentWord.querySelector("x-letter.active");

  const currentWord = $currentWord.innerText.trim();
  $input.maxLength = currentWord.length;
  console.log({ value: $input.value, currentWord });

  const $allLetters = $currentWord.querySelectorAll("x-letter");

  $allLetters.forEach(($letter) =>
    $letter.classList.remove("correct", "incorrect")
  );

  $input.value.split("").forEach((char, index) => {
    const $letter = $allLetters[index];
    const letterCheck = currentWord[index];

    const isCorrect = char === letterCheck;
    $letter.classList.add(isCorrect ? "correct" : "incorrect");
  });

  $currentLetter.classList.remove("active", "is-last");
  const inputLength = $input.value.length;
  const $nextActiveLetter = $allLetters[inputLength];

  if ($nextActiveLetter) {
    $nextActiveLetter.classList.add("active");
  } else {
    $currentLetter.classList.add("active", "is-last");
    // TODO: gameover si no hay próxima palabra
  }
}

function gameOver() {
  $game.style.display = "none";
  $results.style.display = "flex";

  const correctWords = $paragraph.querySelectorAll("x-word.correct").length;
  const correctLetters = $paragraph.querySelectorAll("x-letter.correct").length;
  const incorrectLetters =
    $paragraph.querySelectorAll("x-letter.incorrect").length;

  const totalLetters = correctLetters + incorrectLetters;
  const accuracy =
    totalLetters > 0 ? Math.round((correctLetters / totalLetters) * 100) : 0;

  const wpm = Math.round((correctWords / INITIAL_TIME) * 60);

  $wpm.textContent = wpm;
  $accuracy.textContent = accuracy;
}
