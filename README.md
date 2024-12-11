# COMP 3512 Assignment 2 - F1 Dashboard Single-Page App 

This repository contains the code of an F1 Dashboard, a single-page app built for COMP 3512 Assignment 2 at Mount Royal University. The application uses JavaScript to fetch, display, and manage Formula 1 race data, offering an interactive user experience while being intuitive.

## Overview

The F1 Dashboard is a dynamic, single-page application that displays and interacts with Formula 1 race data, including races, drivers, constructors, and circuits. It utilizes local storage to optimize performance and minimize API calls.

## Features

- **Single-Page Architecture:** The application uses a single `index.html` file.
- **Two Main Views:**
  - **Home View:** Provides an introduction and season selection.
  - **Races View:** Displays race information for the selected season.
- **Dialog Popups:**
  - **Favorites:** Manage your favourite circuits, drivers, and constructors.
  - **Driver Details:** View detailed driver information.
  - **Constructor Details:** View detailed constructor information.
  - **Circuit Details:** View circuit information.
- **Interactive Sorting:** Users can sort races, qualifying results, and race results by clicking column headers.
- **Favorites Management:** Add circuits, drivers, and constructors to your favourites list.
- **Local Storage:** Caches fetched data to enhance performance and reduce server load.

## Technologies Used

- **HTML:** Single `index.html` file with views dynamically managed via JavaScript.
- **CSS:** Custom styles with optional integration of Tailwind CSS for better visuals.
- **JavaScript:** Vanilla JavaScript for all dynamic behaviours (no third-party libraries like jQuery or Bootstrap JS).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/f1-dashboard.git
  
