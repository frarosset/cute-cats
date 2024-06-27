(() => {
  API_KEY = "KBszsvWmSCqazUTsnFOXhIwkQDQxMbK3";

  let searchOffset = -1; // used internally by the API_URL.search method
  API_URL = {
    translate: (query) =>
      `https://api.giphy.com/v1/gifs/translate?api_key=${API_KEY}&s=${query}`,
    random: (query) =>
      `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}&tag=${query}`,
    search: (query) => {
      searchOffset = (searchOffset + 1) % 5000;
      return `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query}&limit=1&offset=${searchOffset}`;
    },
  };

  const img = document.querySelector("img");
  const refreshButton = document.querySelector(".refresh-button");
  const refreshButtonIcon = document.querySelector(".refresh-button i");
  const errorMsg = document.querySelector(".error-msg");
  const apiEndpoints = [];

  const defaultQuery = "cats";
  const defaultApiEndpoint = "search";
  let currentQuery = defaultQuery;
  let currentApiEndpoint = defaultApiEndpoint;

  function getImg(query = currentQuery, apiEndpoint = currentApiEndpoint) {
    console.log(apiEndpoint, query);
    refreshButton.disabled = true;
    apiEndpoints.forEach((apiEndpoint) => (apiEndpoint.disabled = true));
    refreshButtonIcon.classList.add("fa-spin");

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
          throw new Error(
            `Error ${response.meta.status}. ${response.meta.msg}`
          );
        }
      })
      .catch(function (error) {
        errorMsg.textContent = error;
        return setImgSrc("./error.jpg");
      })
      .finally(function () {
        refreshButtonIcon.classList.remove("fa-spin");
        apiEndpoints.forEach((apiEndpoint) => (apiEndpoint.disabled = false));
        refreshButton.disabled = false;
      });
  }

  function setImgSrc(src) {
    return new Promise((resolve) => {
      img.onload = () => {
        resolve();
      };

      img.src = src;
    });
  }

  function setApiEndpoint(apiEndpoint) {
    currentApiEndpoint = apiEndpoint;
    getImg();
  }

  function initApiEndpointSelection() {
    const apiEndpointsDiv = document.querySelector(".api-endpoints-span");

    Object.keys(API_URL).forEach((apiEndpoint) => {
      const label = document.createElement("label");
      const labelTextNode = document.createTextNode(apiEndpoint);
      const input = document.createElement("input");

      input.type = "radio";
      input.name = "api-endpoint";
      input.addEventListener("click", () => setApiEndpoint(apiEndpoint));

      if (apiEndpoint === defaultApiEndpoint) input.checked = true;

      label.append(input, labelTextNode);
      apiEndpointsDiv.appendChild(label);

      apiEndpoints.push(input);
    });
  }

  initApiEndpointSelection();
  getImg();
  refreshButton.addEventListener("click", () => getImg());
})();
