import {
  modifyStyle,
  getExistingElement,
  readFromCache,
  writeToCache,
} from "./helpers/helperFunctions.js";

const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/";
const keyList = ["raceData", "resultData", "qualifyingData"];
const queryList = ["races.php?", "results.php?", "qualifying.php?"];

/**
 * Checks if a key exists in localStorage. If it doesn't it will fetch data from the domain
 * and save it in localStorage with the given key name
 * @param {String} key key to be retrieved form localStorage
 * @param {String} query query to be appended to domain for querying
 * @returns Promise that when resolved will return array of json objects
 */
async function checkLocalStorage(key, query) {
  let localStorageMembers = readFromCache(key);
  if (!localStorageMembers) {
    await writeToCache(domain + query, key);
    localStorageMembers = readFromCache(key);
  }
  return localStorageMembers;
}

/**
 * Creates any valid element with optional attributes and text content
 * @param {String} htmlTag html tag to be created
 * @param {Object} attributes (optional) object of key value pairs where the key is that attribute and the value is the value of the attribute
 * @param {String} textContent (optional) string containing text
 * @returns
 */
function createElement(htmlTag, attributes = {}, textContent = null) {
  const element = document.createElement(htmlTag);
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

/**
 * Adds a row to an existing table
 * @param {String} parentElementSelector css selector referencing parent element in a table
 * @param {Object} object data for populating table row
 * @param {Array} propArr array containing properties to access object values. may contain node elements. must be in order of table headings
 */
function addTableRow(parentElementSelector, object, propArr) {
  const parent = document.querySelector(parentElementSelector);
  const tr = document.createElement("tr");

  propArr.forEach((property) => {
    const td = document.createElement("td");
    if (typeof property === "object") {
      td.appendChild(property);
      tr.appendChild(td);
    } else if (object.hasOwnProperty(property)) {
      td.textContent = object[property];
      tr.appendChild(td);
    }
  });

  parent.appendChild(tr);
}

document.addEventListener("DOMContentLoaded", () => {
  /**
   * TODO in general:
   *  - Need to create podium view
   *  - Create function(s) to populate modals
   *  - Add event listeners to clickable cells in table and display relevant modals
   *  - Either make table heading q1,q2, and q3 clickable (can be hard-coded or dynamic using createElement)
   *    or we could add a dropdown so when the user selects an option, we can sort results based on that.
   *    We can save that for later.
   *  - Fix styling, it's not looking so hot rn
   *  - Bonus if theres time: create and add to favorites view. Saved selected item in a favourites array and
   *  display in favourites view. Remove from favourites by removing it from the favourites array.
   */

  const homeSection = document.querySelector("#homeView");
  const raceViewTitle = document.querySelector("#racesView h2");
  const raceView = document.querySelector("#racesView");
  const qualifyingTable = document.querySelector("#qualifyingTable");
  const driverModal = document.querySelector("#driverModal");
  const dialog = document.querySelector("dialog");
  const closeButton = document.querySelector(".close");
  let viewDriver;

  modifyStyle(".lds-roller", "display", "none");

  /*
  TODO for event listener below:
    1. Hide home view on click
    2. Show loading animation (show before promise.all) - done
    3. Hide loading animation (after promise.all? (not sure)) - done
    4. clean this event listener up
*/
  homeSection.addEventListener("click", async (e) => {
    modifyStyle(".lds-roller", "display", "block");
    modifyStyle("#qualifyingTable", "display", "none");
    document.querySelector("#racesBody").replaceChildren();
    if (e.target.nodeName === "OPTION") {
      let year = e.target.value;
      //fetching and/or populating localStorage
      const localStorageMembers = await Promise.all([
        checkLocalStorage(`raceData${year}`, "races.php?season=" + year),
        checkLocalStorage(`resultData${year}`, "results.php?season=" + year),

        checkLocalStorage(
          `qualifyingData${year}`,
          "qualifying.php?season=" + year
        ),
      ]);
      modifyStyle(".lds-roller", "display", "none");
      modifyStyle("#racesView", "display", "block");
      const raceData = localStorageMembers[0];

      raceViewTitle.textContent = `Races for ${year}`;

      //populating racesBody table
      raceData.forEach((raceObj) => {
        let link = createElement(
          "a",
          {
            href: "#",
            "data-id": raceObj["id"],
            id: `viewRace`,
            "data-year": year,
          },
          "View Race"
        );
        addTableRow("#racesBody", raceObj, ["round", "name", link]);
      });
    }
  });

  raceView.addEventListener("click", populateQualifying);

  function populateQualifying(e) {
    document.querySelector("#qualifyingTable tbody").replaceChildren();
    if (e.target.nodeName === "A") {
      const year = e.target.dataset.year;
      const raceID = e.target.dataset.id;

      let qualifying = readFromCache(`qualifyingData${year}`);
      let matches = qualifying.filter((q) => q.race.id == raceID); // raceID is a string so == is used instead of ===

      matches.forEach((matchObj) => {
        const driverAttributes = {
          "data-driver-id": matchObj.driver["id"],
          "data-driver-ref": matchObj.driver["ref"],
          href: "#",
          id: "viewDriver",
        };
        viewDriver = document.querySelector("#viewDriver");
        const constructorAttributes = {
          "data-constructor-id": matchObj.constructor["id"],
          "data-constructor-ref": matchObj.constructor["ref"],
          href: "#",
          id: "viewConstructors",
        };
        const driverLink = createElement(
          "a",
          driverAttributes,
          `${matchObj.driver.forename} ${matchObj.driver.surname}`
        );
        const constructorLink = createElement(
          "a",
          constructorAttributes,
          `${matchObj.constructor.name}`
        );

        addTableRow("#qualifyingTable tbody", matchObj, [
          "position",
          driverLink,
          constructorLink,
          "q1",
          "q2",
          "q3",
        ]);
      });
      modifyStyle("#qualifyingTable", "display", "block");
    }
  }

  qualifyingTable.addEventListener("click", (e) => {
    if (e.target.nodeName === "A" && e.target.id === "viewDriver") {
      driverModal.showModal();
    }
  });

  /** TODO: create a function that add event listener to all dialog boxes for opening and closing
   * Also make one for populating modal based on different criteria, you'll call this in event listener above
   */
  driverModal.addEventListener("click", (e) => {
    if (e.target.className === "close") {
      driverModal.close();
    }
  });
});
