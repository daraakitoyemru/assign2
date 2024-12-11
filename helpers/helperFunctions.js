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

/**
 * This allow the table contents to be sorted by clicking table headers.
 * The sorting logic was done using claude ai in interest of time. The display
 * logic of and event handling were done myself (dara)
 */
function setupTableSorting() {
  const tables = document.querySelectorAll("table");

  tables.forEach((table) => {
    const headers = table.querySelectorAll("thead th");
    const upArrow = document.createElement("i");
    const downArrow = document.createElement("i");
    upArrow.classList = "bx bx-up-arrow-alt";
    downArrow.classList = "bx bx-down-arrow-alt";

    headers.forEach((header, index) => {
      header.style.cursor = "pointer";
      header.addEventListener("click", () => {
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.querySelectorAll("tr"));

        const isAscending = header.dataset.sortDirection !== "asc";
        header.dataset.sortDirection = isAscending ? "asc" : "desc";

        header.innerHTML = header.textContent;
        if (header.dataset.sortDirection === "asc") {
          header.appendChild(upArrow);
          //header.style.display = "inline-flex";
        } else if (header.dataset.sortDirection === "desc") {
          header.appendChild(downArrow);
          //header.style.display = "inline-flex";
        }
        // Reset other headers' sort indicators
        headers.forEach((h) => {
          if (h !== header) {
            h.dataset.sortDirection = "default";
            h.innerHTML = h.textContent;
          }
        });

        rows.sort((a, b) => {
          const cellA = a.querySelectorAll("td")[index].textContent.trim();
          const cellB = b.querySelectorAll("td")[index].textContent.trim();

          // Try to convert to number for numeric sorting
          const numA = parseFloat(cellA);
          const numB = parseFloat(cellB);

          if (!isNaN(numA) && !isNaN(numB)) {
            return isAscending ? numA - numB : numB - numA;
          }

          // Fallback to string comparison
          return isAscending
            ? cellA.localeCompare(cellB)
            : cellB.localeCompare(cellA);
        });

        // Clear and re-append sorted rows
        tbody.innerHTML = "";
        rows.forEach((row) => tbody.appendChild(row));
      });
    });
  });
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

export {
  modifyStyle,
  writeToCache,
  readFromCache,
  addTableRow,
  decodeText,
  createElement,
  setupTableSorting,
};
