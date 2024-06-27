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

  const defaultQuery = "cats";
  const defaultApi = "translate";
  let currentQuery = defaultQuery;
  let currentApi = defaultApi;

  function getImg(query = currentQuery, api = currentApi) {
    console.log(api, query);
    refreshButton.disabled = true;
    refreshButtonIcon.classList.add("fa-spin");

    fetch(API_URL[api](query), {
      mode: "cors",
    })
      .then(function (response) {
        return response.json(); // returns a Promise
      })
      .then(function (response) {
        if (response.meta.status === 200) {
          let gifUrl;
          if (Array.isArray(response.data)) {
            gifUrl = response.data[0].images.original.url;
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
      })
      .finally(function () {
        refreshButtonIcon.classList.remove("fa-spin");
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

  getImg();
  refreshButton.addEventListener("click", () => getImg());
})();
