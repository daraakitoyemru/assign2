import {
  modifyStyle,
  getExistingElement,
  readFromCache,
  writeToCache,
} from "./helpers/helperFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
  const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/";
  const homeSection = document.querySelector("#homeView");
  const raceViewTitle = document.querySelector("#racesView h2");
  const keyList = ["raceData", "resultData", "qualifyingData"];
  const queryList = ["races.php?", "results.php?", "qualifying.php?"];
  // i'll refactor this later. this happens as soon as the DOM loads,

  async function checkLocalStorage(key, query) {
    let localStorageMembers = readFromCache(key);
    if (!localStorageMembers) {
      await writeToCache(domain + query, key);
      localStorageMembers = readFromCache(key);
    }
    return localStorageMembers;
  }

  function createElement(selector, attributes = {}, textContent = null) {
    const element = document.createElement(selector);

    if (JSON.stringify(attributes) !== "{}") {
      //credits : https://masteringjs.io/tutorials/fundamentals/foreach-object
      Object.entries(attributes).forEach((entry) => {
        const [key, value] = entry;
        element.setAttribute(key, value);
      });
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  function addTableRow(parentElementSelector, object, propArr, element = null) {
    const parent = document.querySelector(parentElementSelector);
    const tr = document.createElement("tr");

    propArr.forEach((property) => {
      if (object.hasOwnProperty(property)) {
        const td = document.createElement("td");
        td.textContent = object[property];
        tr.appendChild(td);
      }
    });

    if (element) {
      tr.appendChild(element);
    }

    parent.appendChild(tr);
  }

  homeSection.addEventListener("click", async (e) => {
    document.querySelector("#racesBody").replaceChildren();
    if (e.target.nodeName === "OPTION") {
      /* 1. clear home view section
        2. Check local storage, populate if null
        3. Show loading animation
        4. Populate table, hide loading animation
      */
      let year = e.target.value;
      const localStorageMembers = await Promise.all([
        checkLocalStorage(`raceData${year}`, "races.php?season=" + year),
        checkLocalStorage(`resultData${year}`, "results.php?season=" + year),

        checkLocalStorage(
          `qualifyingData${year}`,
          "qualifying.php?season=" + year
        ),
      ]);

      const [raceData, resultData, qualifyingData] = localStorageMembers;

      raceViewTitle.textContent = `Races for ${year}`;
      raceData.forEach((raceObj) => {
        let link = createElement(
          "a",
          { href: "#", "data-id": raceObj["id"] },
          "View Race"
        );
        addTableRow("#racesBody", raceObj, ["round", "name"], link);
      });
      modifyStyle("#racesView", "display", "block");
    }
  });
});
