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
const restaurantDisplay = $("#restaurant-display");
const sectionDisplay = $("#section");
const preSearchPlaceHolder = $(".place-holder");

const searchHistory = $(".searchHistory");
const historyButton = $(".historyButton");
const alertBox = $("#alert-box")
let currentCityID = "";
const cityNameArray = [];

$(window).ready(function () {
  let searchStorage = localStorage.getItem("City Searches");
  let searchArray = JSON.parse(searchStorage);
  searchArray.forEach((search) => {
    searchHistory.append(addHistoryButton(search));
  });
});

// takes input when user searches for city
function citySearchQuery() {
  $.ajax({
      url: queryUrlLocation + citySearch.val() + apiKey,
    })
    .then(function (response) {
      // returned with an array of options for search
      let countryName = response.location_suggestions;
      // filtering to only use the United Kingdom option
      let output = countryName.filter(function (title) {
        return title.country_name === "United Kingdom";
      });
      // getting the CityID from the city search API to then use in the next function
      const cityOutput = output[0].id;
      const cityName = output[0].name;
      currentCityID = cityOutput;
      developedRestaurantSearch(cityOutput);
      console.log(cityName);
      // pushing city name to an array on search
      cityNameArray.push(cityName);
      searchHistoryButtons(cityNameArray);
    })
    .catch(function () {
      alert("Error");
    });
}
// function to create the search history buttons
function searchHistoryButtons(cityNameArray) {
  // create an array with only unique entries
  let uniqueSearches = Array.from(new Set(cityNameArray));
  console.log(uniqueSearches);
  // set to session storage
  localStorage.setItem("City Searches", JSON.stringify(uniqueSearches));
  /*  uniqueSearches.forEach((search) => {
    searchHistory.append(addHistoryButton(search));
  }); */
}

function addHistoryButton(search) {
  return ` 
  <button class='historyButton uk-button uk-button-secondary' id='10' data-location='${search}'>${search}</button>
  
  `;
}

$(".searchHistory").on("click", function (event) {
  let historyData = event.target.getAttribute("data-location");
  citySearch.val(historyData);
  citySearchQuery();
  $(".search-filter").click();
});

//Alert to create a pop up to suggest changes to the edit
//function badSearch() {
  //return ` <div uk-alert>
  //<a class="uk-alert-close" uk-close></a>
  //<h3>Notice</h3>
  //<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
    //labore et dolore magna aliqua.</p>
//</div>`
//}

//function badSearchReturn() {
  //if ($("#alert-box").innerHTML === "") {
    //$("#alert-box").html(badSearch())
  //}
//}

const cuisineArray = [];

$("#cuisine-container button").click(function () {
  let cuisineData = $(this).attr("data-cuisine");
  console.log(cuisineData);
  if (cuisineData && currentCityID) {
    developedRestaurantSearch(currentCityID, cuisineData);
  }
});

const developedSearchStart =
  "https://developers.zomato.com/api/v2.1/search?entity_id=";
const developedSearchEnd = "&entity_type=city&count=10&sort=rating&order=desc";

function developedRestaurantSearch(cityOutput, cuisineID) {
  clearDisplay();
  const cuisineSearch = "&cuisines=" + cuisineID;
  $.ajax({
    url: developedSearchStart +
      cityOutput +
      cuisineSearch +
      developedSearchEnd +
      apiKey,
  }).then(function (restaurants) {
    console.log("restaraunt response ", restaurants);
    const bestRestaurants = restaurants.restaurants;
    let lat = [];
    let lon = [];
    let location = [];
    // for each restaurant in the best restaurant array
    // will need to add more to display address, links, menus, reviews etc

    bestRestaurants.forEach(({
      restaurant
    }) => {
      restaurantDisplay.append(createCard(restaurant));
      lat.push(Number(restaurant.location.latitude));
      lon.push(Number(restaurant.location.longitude));
      location.push(restaurant.location.locality);
      /* initMap(lat, lon, location); */
    });
    $(".animate-fade-in").fadeIn(1000);
  });
}

function createCard(restaurant) {
  return `<div>
  <div class="uk-card uk-card-small uk-card-default animate-fade-in hide">
						<div class="uk-card-header">
							<div class="uk-grid uk-grid-small uk-text-small" data-uk-grid>
								<div class="uk-width-expand">
									<span class="cat-txt"id="restaurant-name">${restaurant.name}</span>
								</div>
								<div class="uk-width-auto uk-text-right uk-text-muted">
									<p><span data-uk-icon="icon:star; ratio: 0.8"></span> <span class="rating"id="Rating">${
                    restaurant.user_rating.aggregate_rating
                  }</span>
									</p>
								</div>
							</div>
						</div>
						<div class="uk-card-media-top">
							<img src="${placeHolderImage(restaurant)}" alt="" class="uk-width-expand">
						</div>
						<div class="uk-card-body">
							<h6 class="uk-margin-small-bottom uk-margin-remove-adjacent uk-text-bold">${reduceCuisines(
                restaurant.cuisines,
                3
              )}</h6>
							<p class="uk-text-small uk-text-muted"id="text">${
                restaurant.location.address
              }</p>
						</div>
						<div class="uk-card-footer">
							<div class="uk-grid uk-grid-small uk-grid-divider uk-flex uk-flex-middle" data-uk-grid>
								<div class="uk-width-expand uk-text-small">
                ${priceCalculator(
                  restaurant.average_cost_for_two
                )} <span id="distance"></span>
								</div>
                <div class="uk-width-auto uk-text-right">
                
									<a href="${
                    restaurant.url
                  }" target="_blank" data-uk-tooltip="title: Website" class="uk-icon-link"
										data-uk-icon="icon:world; ratio: 0.8"></a>
								</div>
							</div>
						</div>
          </div>
          </div>`;
}

function reduceCuisines(cuisines, amount) {
  return cuisines.split(",").splice(0, amount);
}

function priceCalculator(priceForTwo) {
  if (priceForTwo <= 40) {
    return "£";
  } else if (priceForTwo < 60) {
    return "££";
  } else {
    return "£££";
  }
}

function placeHolderImage(restaurant) {
  const placeholderText = "Image Coming Soon";
  if (restaurant.thumb === "") {
    return (
      "https://via.placeholder.com/309/000000/FFFFFF?text=" + placeholderText
    );
  } else {
    return restaurant.thumb;
  }
}

//Clear the current search function
function clearDisplay() {
  restaurantDisplay.empty();
}

//IF ELSE statement to minimise code
//function showSection(){
//  if ($("#section").hasClass("hide")){
//    $("section").removeClass("hide").addClass("no-hide");
//  }else ($("#section").hasClass("no-hide")){
//    $("section").removeClass("no-hide").addClass();
//  }
//}

//Show the filters / show the box for the cards
function showSection() {
  sectionDisplay.removeClass("hide");
}

//Hide the filters
function hideSection() {
  sectionDisplay.addClass("hide");
}

//Clear the pre search place holder
function clearPlaceholder() {
  preSearchPlaceHolder.addClass("hide");
}

//Add the placholder
function addPlaceholder() {
  preSearchPlaceHolder.removeClass("hide");
}

function clearSearchField() {
  citySearch.val("");
}

//On submit on search form it will run the function
$("#search-form").submit(function (event) {
  event.preventDefault();
  clearPlaceholder();
  clearDisplay();
  showSection();
  citySearchQuery();
});

//Home button to go back to the main placholder screen
$("#reset").click(function () {
  clearDisplay();
  hideSection();
  addPlaceholder();
  clearSearchField();
});

/* function initMap(lati, long, tit) {
  // The location of restaurants
  const place = {
    lat: lati[0],
    lng: long[0]
  };
  // The map, centered at restaurants
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: place,
  });
  document.querySelector("#map").style.display = "block";
  // The marker, positioned at restaurants
  for (let count = 0; count < 10; count++) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(lati[count], long[count]),
      map: map,
      title: tit[count],
    });
  }
}