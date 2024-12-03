import {
  modifyStyle,
  getExistingElement,
  readFromCache,
  writeToCache,
} from "./helpers/helperFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
  const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/";
  const homeSection = document.querySelector("#homeView");
  // i'll refactor this later. this happens as soon as the DOM loads.
  Promise.all([
    writeToCache(domain + "races.php?", "raceData"),
    writeToCache(domain + "results.php?", "resultData"),
    writeToCache(domain + "qualifying.php?", "qualifyingData"),
  ]).then((response) => {
    console.log(response);
  });
  /* Basically if we wanna get specific data, we can use readFromCache() and then use
find() or filter() to get specific results based on user input.
*/

  homeSection.addEventListener("click", (e) => {
    if (e.target.nodeName === "OPTION") {
      let value = e.target.value;
      console.log(`${e.target} clicked`);
      modifyStyle("#racesView", "display", "block");
      //writeToCache(domain + `races.php?${value}`, "data");
      console.log(readFromCache("raceData"));
    }
  });
});
