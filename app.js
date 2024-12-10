import {
  modifyStyle,
  getExistingElement,
  readFromCache,
  writeToCache,
  decodeText,
} from "./helpers/helperFunctions.js";

const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/";

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
  const homeSection = document.querySelector("#homeView");
  const seasonSelect = document.querySelector("#seasonSelect");
  const raceViewTitle = document.querySelector("#racesView h2");
  const raceView = document.querySelector("#racesView");
  const qualifyingTable = document.querySelector("#qualifyingTable");
  const driverModal = document.querySelector("#driverModal");
  const dialog = document.querySelector("dialog");
  const closeButton = document.querySelector(".close");
  const homeViewBtn = document.getElementById("homeViewBtn");
  const addToFavoritesBtn = document.querySelector(".addToFavoritesBtn");
  const seeFavBtn = document.querySelector("#favoritesBtn");
  const favoritesModal = document.querySelector("#favoritesModal");
  const cardProfile = document.querySelector(".profile");
  const racesViewBtn = document.getElementById("racesViewBtn");
  const FAVORITES_KEYS = {
    circuits: "favoriteCircuits",
    drivers: "favoriteDrivers",
    constructors: "favoriteConstructors",
  };

  let viewDriver;
  let year;
  modifyStyle(".lds-roller", "display", "none");

  homeViewBtn.addEventListener("click", () => {
    homeView.style.display = "none";
    racesView.style.display = "none";
    qualifyingTable.style.display = "none";
    homeView.style.display = "flex";
  });

  homeSection.addEventListener("change", async (e) => {
    if (e.target.nodeName === "SELECT" && e.target.id === "seasonSelect") {
      modifyStyle(".lds-roller", "display", "block");
      document.querySelector("#racesBody").replaceChildren();
      const year = e.target.value;

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
      homeSection.style.display = "none";
      const raceData = localStorageMembers[0];

      raceViewTitle.textContent = `Races for ${year}`;
      raceViewTitle.setAttribute("data-year", year);

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
    const favoriteDrivers = readFromCache("favoriteDrivers") || [];

    if (e.target.nodeName === "A") {
      const year = e.target.dataset.year;
      const raceID = e.target.dataset.id;

      let qualifying = readFromCache(`qualifyingData${year}`);
      let matches = qualifying.filter((q) => q.race.id == raceID); // raceID is a string so == is used instead of ===

      matches.forEach((matchObj) => {
        const driverAttributes = {
          "data-driver-id": matchObj.driver["id"],
          "data-driver-ref": matchObj.driver["ref"],
          "data-race-year": matchObj.race["year"],
          href: "#",
          id: "viewDriver",
        };
        viewDriver = document.querySelector("#viewDriver");
        const constructorAttributes = {
          "data-constructor-id": matchObj.constructor["id"],
          "data-constructor-ref": matchObj.constructor["ref"],
          "data-race-year": matchObj.race["year"],
          href: "#",
          id: "viewConstructors",
        };
        const driverLink = createElement(
          "a",
          driverAttributes,
          `${matchObj.driver.forename} ${decodeText(matchObj.driver.surname)}`
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

        if (favoriteDrivers.includes(matchObj.driver["ref"])) {
          modifyStyle(
            `a[data-driver-ref="${matchObj.driver["ref"]}"]`,
            "color",
            "hotpink"
          );
        } else {
          modifyStyle(
            `a[data-driver-ref="${matchObj.driver["ref"]}"]`,
            "color",
            "black"
          );
        }
      });
      modifyStyle("#qualifyingTable", "display", "block");
    }
  }

  qualifyingTable.addEventListener("click", async (e) => {
    if (e.target.nodeName === "A" && e.target.id === "viewDriver") {
      const driverRef = e.target.dataset.driverRef;
      const year = raceViewTitle.dataset.year;
      await Promise.all([
        checkLocalStorage(
          `driverResults${year}`,
          `driverResults.php?driver=${driverRef}&season=${year}`
        ),
        checkLocalStorage(`driverInfo`, `drivers.php?`),
      ]);
      modifyStyle(".modal", "display", "none");
      modifyStyle("#driverModal .container", "display", "flex");

      populateDriverModal(driverModal, driverRef, year);
    }
  });

  cardProfile.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("addToFavoritesBtn")) {
      const button = e.target;
      const driverRef = button.dataset.driverRef;
      const favoriteDrivers = readFromCache("favoriteDrivers") || [];

      if (!favoriteDrivers.includes(driverRef)) {
        favoriteDrivers.push(driverRef);
        localStorage.setItem(
          "favoriteDrivers",
          JSON.stringify(favoriteDrivers)
        );

        modifyStyle(`a[data-driver-ref="${driverRef}"]`, "color", "hotpink");
        button.disabled = true;
        button.dataset.isFav = "true";
        button.textContent = "Added to Favorites";
      }
    }
  });

  seeFavBtn.addEventListener("click", () => {
    console.log(favoritesModal + "clicked");
    populateFavModal("driver");
  });

  function populateFavModal(type) {
    const driversList = document.querySelector(
      "#favoriteDrivers .favorites-list"
    );
    driversList.replaceChildren();
    let data;
    if (type === "driver") {
      const favoriteDrivers = readFromCache("favoriteDrivers") || [];
      const driverInfo = readFromCache("driverInfo") || [];

      data = driverInfo.filter((obj) =>
        favoriteDrivers.includes(obj["driverRef"])
      );

      // <i class='bx bxs-trash-alt'></i>

      data.forEach((d) => {
        const trashIcon = document.createElement("i");
        trashIcon.classList = "bx bxs-trash-alt";

        const li = document.createElement("li");
        trashIcon.setAttribute("data-delete-driver-item", d.driverRef);
        li.textContent = `${d.forename} ${decodeText(d.surname)}`;
        li.appendChild(trashIcon);
        driversList.appendChild(li);

        trashIcon.addEventListener("click", (e) => {
          removeFromFav(e, "driver");
        });
      });
    }
  }

  function removeFromFav(e, type) {
    if (type === "driver") {
      let driverRef = e.target.dataset.deleteDriverItem;
      e.target.parentElement.style.display = "none";
      modifyStyle(`a[data-driver-ref="${driverRef}"]`, "color", "black");

      const favoriteDrivers = readFromCache("favoriteDrivers") || [];
      const updatedFavorites = favoriteDrivers.filter((f) => f !== driverRef);

      // Update localStorage with the new list of favorite drivers
      localStorage.setItem("favoriteDrivers", JSON.stringify(updatedFavorites));
    }
  }

  /** TODO: create a function that add event listener to all dialog boxes for opening and closing
   * Also make one for populating modal based on different criteria, you'll call this in event listener above
   */
  driverModal.addEventListener("click", (e) => {
    if (e.target.className === "close") {
      driverModal.close();
    }
  });

  favoritesModal.addEventListener("click", (e) => {
    if (e.target.className === "close") {
      favoritesModal.close();
    }
  });

  seeFavBtn.addEventListener("click", () => {
    favoritesModal.showModal();
  });
  /**-------------------------------------- non event listeners ---------------------------- */

  function populateDriverModal(modal, ref, year) {
    modal.showModal();
    let driverInfo = readFromCache("driverInfo");
    let driverResultsData = readFromCache(`driverResults${year}`);

    let driver = driverInfo.find((data) => data.driverRef == ref);

    populateDriverCard(driver);

    let resultDataForYear = readFromCache(`resultData${year}`);
    let resultData;

    driverResultsData.forEach((data) => {
      let resultID = data.resultId;
      resultData = resultDataForYear.filter((r) => r.id == resultID);
      let points = resultData[0].points;
      let pointsTextNode = document.createTextNode(points);
      addTableRow("#driverResultsTable", data, [
        "round",
        "name",
        "positionOrder",
        pointsTextNode,
      ]);
    });
  }

  function populateDriverCard(data) {
    const driverName = document.querySelector(".driverName");
    const nationality = document.querySelector(".nationality");
    const dob = document.querySelector(".driverDOB");
    const url = document.querySelector(".wiki");

    data = [data];

    data.forEach((d) => {
      addToFavoritesBtn.setAttribute("data-driver-ref", `${d.driverRef}`);
      addToFavoritesBtn.setAttribute("data-is-fav", "false");

      // Check if this driver is already in favorites
      const favoriteDrivers = readFromCache("favoriteDrivers") || [];
      if (favoriteDrivers.includes(d.driverRef)) {
        addToFavoritesBtn.disabled = true;
        addToFavoritesBtn.textContent = "Added to Favorites";
        addToFavoritesBtn.dataset.isFav = "true";
      } else {
        addToFavoritesBtn.disabled = false;
        addToFavoritesBtn.textContent = "Add to Favorites";
        addToFavoritesBtn.dataset.isFav = "false";
      }

      driverName.textContent = `${d.forename} ${decodeText(d.surname)}`;
      nationality.textContent = `Nationality: ${d.nationality}`;
      dob.textContent = `DOB: ${d.dob}`;
      url.addEventListener("click", () => {
        window.open(`${d.url}`, "_blank");
      });
    });
  }
});
