/**-------------------------------------------DATA RETRIEVAL HELPER FUNCTIONS------------------- */

/**
 * An asynchronous function that fetches data from a source and saves it to local
 * storage.
 * @param {String} url url containing data
 * @param {String} key given key name
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
 * @param {String} key key that is searched for in local storage
 * @returns Array of object if key exists in localStorage, null otherwise
 */
function readFromCache(key) {
  let data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/** ------------------------------------MARKUP HELPER FUNCTION----------------------------- */

/**
 * This modifies a single style property for a given element
 * @param {String} selector css selector for element
 * @param {String} styleType css property to be modified
 * @param {String} property value of css property
 */
function modifyStyle(selector, styleType, property) {
  try {
    const element = document.querySelector(selector);
    element.style[styleType] = property;
  } catch (error) {
    console.error(error);
  }
}

// Utility Functions
function createElement(htmlTag, attributes = {}, textContent = null) {
  const element = document.createElement(htmlTag);

  if (Object.keys(attributes).length > 0) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function addTableRow(parentElementSelector, object, propArr) {
  const parent = document.querySelector(parentElementSelector);
  const tr = document.createElement("tr");

  propArr.forEach((property) => {
    const td = document.createElement("td");

    if (typeof property === "object") {
      td.appendChild(property);
    } else if (object.hasOwnProperty(property)) {
      td.textContent = object[property];
    }

    tr.appendChild(td);
  });

  parent.appendChild(tr);
}

function decodeText(text) {
  try {
    return decodeURIComponent(escape(text));
  } catch (e) {
    console.error("Failed to decode text:", e);
    return text; // Fallback to original text if decoding fails
  }
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
  decodeText,
  createElement,
};
