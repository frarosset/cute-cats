(() => {
  API_KEY = "KBszsvWmSCqazUTsnFOXhIwkQDQxMbK3";

  const img = document.querySelector("img");
  const refreshButton = document.querySelector(".refresh-button");
  const refreshButtonIcon = document.querySelector(".refresh-button i");

  function getImg() {
    refreshButton.disabled = true;
    refreshButtonIcon.classList.add("fa-spin");

    fetch(`https://api.giphy.com/v1/gifs/translate?api_key=${API_KEY}&s=cats`, {
      mode: "cors",
    })
      .then(function (response) {
        return response.json(); // returns a Promise
      })
      .then(function (response) {
        return setImgSrc(response.data.images.original.url); // returns a Promise
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
  refreshButton.addEventListener("click", getImg);
})();
