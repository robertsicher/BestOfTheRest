/* var search = UIkit.util.$(".search-fld");
var searchVal = UIkit.util.$(".search-filter");
var filterBtn = UIkit.util.$$("li[data-uk-filter-control] a");
var formEl = UIkit.util.$("#search-form");
var debounce;

UIkit.util.on(search, "keyup", function () {
  clearTimeout(debounce);
  debounce = setTimeout(function () {
    var value = search.value;
    var finalValue = value.toLowerCase();
    var searchTerm = "";

    if (value.length) searchTerm = '[data-tags*="' + finalValue + '"]';
    UIkit.util.attr(searchVal, "data-uk-filter-control", searchTerm);
    searchVal.click();
  }, 300);
});

// prevent send form on press enter
UIkit.util.on(formEl, "keypress", function (e) {
  var key = e.charCode || e.keyCode || 0;
  if (key == 13) {
    e.preventDefault();
    console.log("Prevent submit on press enter");
  }
});

// empty field and attribute on click filter button
UIkit.util.on(filterBtn, "click", function () {
  var inputVal = search.value;
  if (inputVal.length) {
    // empty field
    search.value = "";
    searchTerm = '[data-tags*=""]';
    // empty attribute
    UIkit.util.attr(searchVal, "data-uk-filter-control", searchTerm);
    console.log("empty field and attribute");
  }
}); */

const citySearch = $(".search-fld");
const apiKey = "&apikey=b718873bcc30e1bfc3eb75f18f1a3f5a";
const queryUrlLocation = "https://developers.zomato.com/api/v2.1/cities?q=";

// takes input when user searches for city
function citySearchQuery() {
  $.ajax({
    url: queryUrlLocation + citySearch.val() + apiKey,
  })
    .then(function (response) {
      console.log("city response", response);
      // returned with an array of options for search
      let countryName = response.location_suggestions;
      // filtering to only use the United Kingdom option
      let output = countryName.filter(function (title) {
        return title.country_name === "United Kingdom";
      });
      // getting the CityID from the city search API to then use in the next function
      const cityOutput = output[0].id;
      restarauntSearch(cityOutput);
    })
    .catch(function () {
      alert("Invalid City");
    });
}

const queryURLRestaurant =
  "https://developers.zomato.com/api/v2.1/location_details?entity_id=";
function restarauntSearch(cityOutput) {
  $.ajax({
    url: queryURLRestaurant + cityOutput + "&entity_type=city" + apiKey,
  }).then(function (restaurants) {
    console.log("restaraunt response ", restaurants);
    const bestRestaurants = restaurants.best_rated_restaurant;
    // for each restaurant in the best restaurant array
    // will need to add more to display address, links, menus, reviews etc
    bestRestaurants.forEach((restaurant) => {
      let restArray = restaurant.restaurant;
      let restName = restArray.name;
      let restLocation = restArray.location.zipcode;
      let restRating = restArray.user_rating.aggregate_rating;
      console.log("Restaurant Name", restName);
      console.log("Restaurant Postcode", restLocation);
      console.log("Restaurant Rating", restRating);
    });
  });
}

// on submit on search form it will run the function
$("#search-form").submit(function (event) {
  event.preventDefault();
  citySearchQuery();
  console.log("hello");
});
