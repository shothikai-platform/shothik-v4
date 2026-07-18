const sentence = "I am a bad sentences that have an errors.";
const error = "errors";
const correct = "error";

const escapedWord = error.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const regex = new RegExp(`(${escapedWord})`, "gi");

const parts = sentence.split(regex);
console.log(parts);
