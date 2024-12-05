/**
 * This modifies a single style property for a given element
 * @param {string} selector css selector for element
 * @param {string} styleType css property to be modified
 * @param {string} property value of css property
 */
function modifyStyle(selector, styleType, property) {
  const element = document.querySelector(selector);
  element.style[styleType] = property;
}

/**
 * An asynchronous function that fetches data from a source and saves it to local
 * storage.
 * @param {string} url url containing data
 * @param {string} key given key name
 */
async function writeToCache(url, key) {
  try {
    let res = await fetch(url);
    let data = await res.json();
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error fetching data: " + error);
  }
}
/**
 * A function that reads from localStorage and checks if the given key exists
 * @param {string} key key that is searched for in local storage
 * @returns Array of object if key exists in localStorage, null otherwise
 */
function readFromCache(key) {
  let data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Takes an object and maps it values so a single table row.
 *
 * @param {string} parentElementSelector css selector for element
 * @param {object} object object to iterated over
 */
function addTableRow(parentElementSelector, object) {
  const parent = document.querySelector(parentElementSelector);
  const tr = document.createElement("tr");

  Object.values(object).forEach((value) => {
    const td = document.createElement("td");
    td.textContent = value;
    tr.appendChild(td);
  });

  parent.appendChild(tr);
}

function getExistingElement(selector, isNodeList = false) {
  if (isNodeList) {
    return document.querySelectorAll(selector);
  } else {
    return document.querySelector(selector);
  }
}

export {
  modifyStyle,
  getExistingElement,
  writeToCache,
  readFromCache,
  addTableRow,
};
