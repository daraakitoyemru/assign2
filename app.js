import {
  modifyStyle,
  getExistingElement,
  readFromCache,
  writeToCache,
  decodeText,
  createElement,
  addTableRow,
} from "./helpers/helperFunctions.js";

const DOMAIN = "https://www.randyconnolly.com/funwebdev/3rd/api/f1/";
const FAVORITES_KEYS = {
  circuits: "favoriteCircuits",
  drivers: "favoriteDrivers",
  constructors: "favoriteConstructors",
};

// Local Storage Helpers
async function checkLocalStorage(key, query) {
  let localStorageMembers = readFromCache(key);

  if (!localStorageMembers) {
    await writeToCache(DOMAIN + query, key);
    localStorageMembers = readFromCache(key);
  }

  return localStorageMembers;
}

// Favorites Management
function handleFavorite(itemRef, storageKey, styleCallback, button) {
  const favorites = JSON.parse(localStorage.getItem(storageKey)) || [];

  if (!favorites.includes(itemRef)) {
    favorites.push(itemRef);
    localStorage.setItem(storageKey, JSON.stringify(favorites));

    styleCallback(itemRef, button);

    if (button) {
      button.disabled = true;
      button.dataset.isFav = "true";
      button.textContent = "Added to Favorites";
    }
  }
}

function removeFromFav(e, type, dataset, key) {
  let itemRef = e.target.dataset[dataset];
  e.target.parentElement.style.display = "none";
  modifyStyle(`a[data-${type}-ref="${itemRef}"]`, "color", "black");

  const data = readFromCache(key) || [];
  const updatedFavorites = data.filter((f) => f !== itemRef);

  localStorage.setItem(key, JSON.stringify(updatedFavorites));
}

// Modal Population Functions
function populateDriverModal(modal, ref, year) {
  modal.showModal();

  let driverInfo = readFromCache("driverInfo");
  let driverResultsData = readFromCache(`driverResults${year}`);

  let driver = driverInfo.find((data) => data.driverRef == ref);
  populateDriverCard(driver);

  let resultDataForYear = readFromCache(`resultData${year}`);

  driverResultsData.forEach((data) => {
    let resultID = data.resultId;
    let resultData = resultDataForYear.filter((r) => r.id == resultID);
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

function populateConstructorModal(modal, year, ref) {
  modal.showModal();

  let constructorInfo = readFromCache("constructorInfo");
  let constructorResults = readFromCache(`constructorResults${year}`);

  let data = constructorInfo.find((c) => c.constructorRef == ref);
  populateConstructorCard(data);

  const constructorResultsTable = document.querySelector(
    "#constructorResultsTable"
  );
  constructorResultsTable.innerHTML = "";

  constructorResults.forEach((data) => {
    const name = `${data.forename} ${decodeText(data.surname)}`;
    const nameNode = document.createTextNode(name);

    addTableRow("#constructorResultsTable", data, [
      "round",
      "name",
      nameNode,
      "positionOrder",
    ]);
  });
}

function populateDriverCard(data) {
  const [d] = [data];
  const addToFavoritesBtn = document.querySelector(".addToFavoritesBtn");

  addToFavoritesBtn.setAttribute("data-driver-ref", `${d.driverRef}`);
  addToFavoritesBtn.setAttribute("data-is-fav", "false");

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

  document.querySelector(".driverName").textContent = `${
    d.forename
  } ${decodeText(d.surname)}`;
  document.querySelector(
    ".nationality"
  ).textContent = `Nationality: ${d.nationality}`;
  document.querySelector(".driverDOB").textContent = `DOB: ${d.dob}`;

  const wikiLink = document.querySelector(".wiki");
  wikiLink.addEventListener("click", () => {
    window.open(`${d.url}`, "_blank");
  });
}

function populateConstructorCard(data) {
  const [d] = [data];
  const addToFavoritesBtn = document.querySelector(
    "#constructorModal .addToFavoritesBtn"
  );

  document.querySelector("#constructorModal .constructorName").textContent =
    d.name;
  addToFavoritesBtn.setAttribute("data-constructor-ref", `${d.constructorRef}`);

  const favoriteConstructors = readFromCache("favoriteConstructors") || [];
  if (favoriteConstructors.includes(d.constructorRef)) {
    addToFavoritesBtn.disabled = true;
    addToFavoritesBtn.textContent = "Added to Favorites";
    addToFavoritesBtn.dataset.isFav = "true";
  } else {
    addToFavoritesBtn.disabled = false;
    addToFavoritesBtn.textContent = "Add to Favorites";
    addToFavoritesBtn.dataset.isFav = "false";
  }

  const nationality = document.querySelector("#constructorModal .nationality");
  nationality.textContent = `Nationality: ${d.nationality}`;

  const wikiLink = document.querySelector("#constructorModal .wiki");
  wikiLink.addEventListener("click", () => {
    window.open(`${d.url}`, "_blank");
  });
}

// Event Listeners and Main Application Logic
document.addEventListener("DOMContentLoaded", () => {
  // DOM Element Selections
  const homeSection = document.querySelector("#homeView");
  const seasonSelect = document.querySelector("#seasonSelect");
  const raceViewTitle = document.querySelector("#racesView h2");
  const raceView = document.querySelector("#racesView");
  const qualifyingTable = document.querySelector("#qualifyingTable");
  const driverModal = document.querySelector("#driverModal");
  const constructorModal = document.querySelector("#constructorModal");
  const homeViewBtn = document.getElementById("homeViewBtn");
  const addToFavoritesBtn = document.querySelector(".addToFavoritesBtn");
  const seeFavBtn = document.querySelector("#favoritesBtn");
  const favoritesModal = document.querySelector("#favoritesModal");
  const cardProfile = document.querySelector(".profile");
  const racesViewBtn = document.getElementById("racesViewBtn");

  modifyStyle(".lds-roller", "display", "none");

  // Home View Navigation
  homeViewBtn.addEventListener("click", () => {
    homeView.style.display = "none";
    racesView.style.display = "none";
    qualifyingTable.style.display = "none";
    homeView.style.display = "flex";
  });

  // Season Selection and Race Data Loading
  homeSection.addEventListener("change", async (e) => {
    if (e.target.nodeName === "SELECT" && e.target.id === "seasonSelect") {
      modifyStyle(".lds-roller", "display", "block");
      document.querySelector("#racesBody").replaceChildren();
      const year = e.target.value;

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

  // Qualifying Data
  raceView.addEventListener("click", populateQualifying);
  function populateQualifying(e) {
    document.querySelector("#qualifyingTable tbody").replaceChildren();
    const favoriteDrivers = readFromCache("favoriteDrivers") || [];
    const favoriteConstructors = readFromCache("favoriteConstructors") || [];
    if (e.target.nodeName === "A") {
      const year = e.target.dataset.year;
      const raceID = e.target.dataset.id;

      let qualifying = readFromCache(`qualifyingData${year}`);
      let matches = qualifying.filter((q) => q.race.id == raceID);

      console.log(matches + " BIG TEXT");
      matches.forEach((matchObj) => {
        let test = JSON.stringify(matchObj.driver);
        console.log(JSON.parse(test) + "  BIG TEXT 2");
        const driverAttributes = {
          "data-driver-id": matchObj.driver["id"],
          "data-driver-ref": matchObj.driver["ref"],
          "data-race-year": matchObj.race["year"],
          href: "#",
          id: "viewDriver",
        };

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
      });
      notifyFav(favoriteConstructors, "constructor");
      notifyFav(favoriteDrivers, "driver");
      modifyStyle("#qualifyingTable", "display", "block");
    }
  }

  function notifyFav(data, type) {
    const nodeList = document.querySelectorAll(`a[data-${type}-ref]`);
    nodeList.forEach((a) => {
      const value = `${a.dataset[type + "Ref"]}`;

      if (data.includes(value)) {
        const matchingLinks = document.querySelectorAll(
          `a[data-${type}-ref="${value}"]`
        );
        matchingLinks.forEach((link) => {
          link.style.color = "hotpink";
        });
      } else {
        const matchingLinks = document.querySelectorAll(
          `a[data-${type}-ref="${value}"]`
        );
        matchingLinks.forEach((link) => {
          link.style.color = "black";
        });
      }
    });
  }

  // Driver Modal Event Listeners
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

  // Constructor Modal Event Listeners
  qualifyingTable.addEventListener("click", async (e) => {
    if (e.target.nodeName === "A" && e.target.id === "viewConstructors") {
      const ref = e.target.dataset.constructorRef;
      const year = e.target.dataset.raceYear;

      await Promise.all([
        checkLocalStorage(
          `constructorResults${year}`,
          `constructorResults.php?constructor=${ref}&season=${year}`
        ),
        checkLocalStorage(`constructorInfo`, `constructors.php?`),
      ]);

      modifyStyle(".modal", "display", "none");
      modifyStyle("#constructorModal .container", "display", "flex");
      populateConstructorModal(constructorModal, year, ref);
    }
  });

  // Favorites Management Event Listeners
  cardProfile.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("addToFavoritesBtn")) {
      const button = e.target;
      const driverRef = button.dataset.driverRef;

      handleFavorite(
        driverRef,
        "favoriteDrivers",
        (ref, btn) =>
          modifyStyle(`a[data-driver-ref="${ref}"]`, "color", "hotpink"),
        button
      );
    }
  });

  const constructorCard = document.querySelector(
    "#constructorModal .container"
  );
  constructorCard.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("addToFavoritesBtn")) {
      const button = e.target;
      const constructorRef = button.dataset.constructorRef;

      handleFavorite(
        constructorRef,
        "favoriteConstructors",
        (ref, btn) =>
          modifyStyle(`a[data-constructor-ref="${ref}"]`, "color", "hotpink"),
        button
      );
    }
  });

  // Favorites Modal Population
  seeFavBtn.addEventListener("click", () => {
    const driversList = document.querySelector(
      "#favoriteDrivers .favorites-list"
    );
    const constructorList = document.querySelector(
      "#favoriteConstructors .favorites-list"
    );
    populateFavModal(
      "driver",
      driversList,
      "favoriteDrivers",
      "driverInfo",
      "driverRef",
      "deleteDriverItem"
    );
    populateFavModal(
      "constructor",
      constructorList,
      "favoriteConstructors",
      "constructorInfo",
      "constructorRef",
      "deleteConstructorItem"
    );
  });

  // give these better names

  function populateFavModal(type, ul, favKey, infoKey, refKey, deleteEventKey) {
    ul.replaceChildren();
    let data;

    const favorites = readFromCache(favKey) || [];
    const info = readFromCache(infoKey) || [];

    // Filter data based on favorites
    data = info.filter((obj) => favorites.includes(obj[refKey]));
    console.log(data);
    data.forEach((item) => {
      const trashIcon = document.createElement("i");
      trashIcon.classList = "bx bxs-trash-alt";

      const li = document.createElement("li");
      trashIcon.setAttribute(`data-delete-${type}-item`, item[refKey]);
      console.log(item.name);
      if (type === "constructor") {
        li.textContent = `${item.name}`;
      } else {
        li.textContent = `${item.forename} ${decodeText(item.surname)}`;
      }

      li.appendChild(trashIcon);
      ul.appendChild(li);

      // Add event listener for trash icon
      trashIcon.addEventListener("click", (e) => {
        removeFromFav(e, type, deleteEventKey, favKey);
      });
    });
  }

  // Modal Close Event Listeners
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

  constructorModal.addEventListener("click", (e) => {
    if (e.target.className === "close") {
      constructorModal.close();
    }
  });

  // Show Favorites Modal
  seeFavBtn.addEventListener("click", () => {
    favoritesModal.showModal();
  });
});
