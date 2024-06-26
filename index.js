(() => {
  API_KEY = "KBszsvWmSCqazUTsnFOXhIwkQDQxMbK3";

  const img = document.querySelector("img");

  function getImg() {
    fetch(`https://api.giphy.com/v1/gifs/translate?api_key=${API_KEY}&s=cats`, {
      mode: "cors",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (response) {
        img.src = response.data.images.original.url;
      });
  }

  getImg();
})();
