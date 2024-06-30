import setCreditFooter from "./creditFooter.js";

(() => {
  const API_KEY = "KBszsvWmSCqazUTsnFOXhIwkQDQxMbK3";
  const GIF_VIEW = ["contain", "cover", "scale-down"];

  let searchOffset = -1; // used internally by the API_URL.search method
  const API_URL = {
    random: (query) =>
      `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}&tag=${query}`,
    search: (query) => {
      searchOffset = (searchOffset + 1) % 5000;
      return `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query}&limit=1&offset=${searchOffset}`;
    },
    translate: (query) =>
      `https://api.giphy.com/v1/gifs/translate?api_key=${API_KEY}&s=${query}`,
  };

  const img = document.querySelector("img");
  const refreshButton = document.querySelector(".refresh-button");
  const refreshButtonIcon = document.querySelector(".refresh-button i");
  const searchButton = document.querySelector(".search-button");
  const searchInput = document.querySelector(".search-input");

  const errorMsg = document.querySelector(".error-msg");
  const apiEndpoints = [];

  const defaultQuery = "cats";
  const defaultApiEndpoint = "search";
  const defaultGifView = "scale-down";
  let currentQuery = defaultQuery;
  let currentApiEndpoint = defaultApiEndpoint;

  // This v1 version handle the Promises using .then(), .catch(), .finally()
  function getImg_v1(query = currentQuery, apiEndpoint = currentApiEndpoint) {
    suspendInputs();

    fetch(API_URL[apiEndpoint](query), { mode: "cors" })
      .then(function (response) {
        return response.json(); // returns a Promise
      })
      .then(function (response) {
        if (response.meta.status === 200) {
          let gifUrl;
          if (Array.isArray(response.data)) {
            if (response.data.length) {
              gifUrl = response.data[0].images.original.url;
            } else {
              throw new Error(`No match for '${query}' found!`);
            }
          } else {
            gifUrl = response.data.images.original.url;
          }
          errorMsg.textContent = "";
          return setImgSrc(gifUrl); // returns a Promise
        } else {
          throw new Error(`${response.meta.status}. ${response.meta.msg}`);
        }
      })
      .catch(function (error) {
        errorMsg.textContent = error;
        toggleSearchInputHiddenClass(true);
        return setImgSrc("./error.jpg");
      })
      .finally(function () {
        resumeInputs();
      });
  }

  // This v2 version handle the Promises using async/await
  async function getImg_v2(
    query = currentQuery,
    apiEndpoint = currentApiEndpoint
  ) {
    suspendInputs();

    try {
      const fetchResponse = await fetch(API_URL[apiEndpoint](query), {
        mode: "cors",
      });
      const response = await fetchResponse.json(); // returns a Promise

      if (response.meta.status === 200) {
        let gifUrl;
        if (Array.isArray(response.data)) {
          if (response.data.length) {
            gifUrl = response.data[0].images.original.url;
          } else {
            throw new Error(`No match for '${query}' found!`);
          }
        } else {
          gifUrl = response.data.images.original.url;
        }
        errorMsg.textContent = "";
        await setImgSrc(gifUrl); // returns a Promise
      } else {
        throw new Error(`${response.meta.status}. ${response.meta.msg}`);
      }
    } catch (error) {
      errorMsg.textContent = error;
      toggleSearchInputHiddenClass(true);
      await setImgSrc("./error.jpg");
    } finally {
      resumeInputs();
    }
  }

  // choose one of the two versions above, just for practising (they are eqivalent)
  const getImg = getImg_v2;

  function suspendInputs() {
    refreshButton.disabled = true;
    searchInput.disabled = true;
    apiEndpoints.forEach((apiEndpoint) => (apiEndpoint.disabled = true));
    refreshButtonIcon.classList.add("fa-spin");
  }

  function resumeInputs() {
    refreshButtonIcon.classList.remove("fa-spin");
    apiEndpoints.forEach((apiEndpoint) => (apiEndpoint.disabled = false));
    searchInput.disabled = false;
    refreshButton.disabled = false;
  }

  function setImgSrc(src) {
    return new Promise((resolve) => {
      img.onload = () => {
        resolve();
      };

      img.src = src;
    });
  }

  function setQueryFromSearchInput() {
    let query = searchInput.value;
    if (query) {
      currentQuery = query;
    } else {
      currentQuery = defaultQuery;
    }
    getImg();
  }

  function setApiEndpoint(apiEndpoint) {
    currentApiEndpoint = apiEndpoint;
    getImg();
  }

  function initGifViewSelection() {
    const gifViewSpan = document.querySelector(".gif-view-span");

    GIF_VIEW.forEach((gifView) => {
      const label = document.createElement("label");
      const labelTextNode = document.createTextNode(gifView);
      const input = document.createElement("input");

      input.type = "radio";
      input.name = "gif-view";
      input.addEventListener("click", () => (img.style.objectFit = gifView));

      if (gifView === defaultGifView) input.checked = true;

      label.append(input, labelTextNode);
      gifViewSpan.appendChild(label);
    });
  }

  function initApiEndpointSelection() {
    const apiEndpointsSpan = document.querySelector(".api-endpoints-span");

    Object.keys(API_URL).forEach((apiEndpoint) => {
      const label = document.createElement("label");
      const labelTextNode = document.createTextNode(apiEndpoint);
      const input = document.createElement("input");

      input.type = "radio";
      input.name = "api-endpoint";
      input.addEventListener("click", () => setApiEndpoint(apiEndpoint));

      if (apiEndpoint === defaultApiEndpoint) input.checked = true;

      label.append(input, labelTextNode);
      apiEndpointsSpan.appendChild(label);

      apiEndpoints.push(input);
    });
  }

  function toggleSearchInputHiddenClass(force = undefined) {
    const state = searchInput.classList.toggle("hidden", force);
    if (!state) {
      /* it has become visible */
      searchInput.focus();
      document.addEventListener("click", hideSearchInputOnClickOutCallback);
    } else {
      document.removeEventListener("click", hideSearchInputOnClickOutCallback);
    }
  }

  function initSearchInput() {
    searchInput.placeholder = defaultQuery;
  }

  // Callbacks

  function refreshButtonClickCallback(e) {
    e.stopImmediatePropagation();
    getImg();
  }

  function searchButtonClickCallback(e) {
    e.stopImmediatePropagation();
    toggleSearchInputHiddenClass();
  }

  function searchInputChangeCallback(e) {
    setQueryFromSearchInput();
  }

  function hideSearchInputOnClickOutCallback(e) {
    if (e.target !== searchInput && !searchInput.classList.contains("hidden")) {
      toggleSearchInputHiddenClass(true);
    }
  }

  // Initialize the page

  initSearchInput();
  toggleSearchInputHiddenClass(true);

  refreshButton.addEventListener("click", refreshButtonClickCallback);
  searchButton.addEventListener("click", searchButtonClickCallback);
  searchInput.addEventListener("change", searchInputChangeCallback);

  initGifViewSelection();
  initApiEndpointSelection();
  getImg();

  setCreditFooter();
})();
