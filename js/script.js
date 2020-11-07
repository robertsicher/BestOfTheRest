const citySearch = $(".search-fld");
const apiKey = "&apikey=b718873bcc30e1bfc3eb75f18f1a3f5a";
const queryUrlLocation = "https://developers.zomato.com/api/v2.1/cities?q=";
const restaurantDisplay = $("#restaurant-display");
const sectionDisplay = $("#section");
const preSearchPlaceHolder = $(".place-holder");
const historyDropdown = $("#historyDropdown");
const searchHistory = $(".searchHistory");
const historyButton = $(".historyButton");
const alertBox = $("#alert-box");
let currentCityID = "";
const cityNameArray = [];

// On page load run the search history function
$(window).ready(function () {
  setSearchHistory();
});

function setSearchHistory() {
  //empty previous search history
  historyDropdown.empty();
  // get search history from local storage and append to dropwdown menu
  let searchStorage = localStorage.getItem("citySearches");
  let searchArray = JSON.parse(searchStorage);
  searchArray.forEach((search) => {
    historyDropdown.append(addHistoryButton(search));
  });
}

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
      // pushing city name to an array on search
      cityNameArray.push(cityName);
      addToHistory(cityName);
    })
    .catch(badSearchReturn);
}

// Adds any search from user to search history list
function addToHistory(cityName) {
  const citySearches = JSON.parse(localStorage.getItem("citySearches"));
  if (citySearches) {
    // if it finds the string in local storage don't add to array
    const citySearch = citySearches.find((c) => c === cityName);
    if (!citySearch) {
      citySearches.push(cityName);
      localStorage.setItem("citySearches", JSON.stringify(citySearches));
    }
  } else {
    localStorage.setItem("citySearches", JSON.stringify([cityName]));
  }
  setSearchHistory();
}

// returns html for dropdown list
function addHistoryButton(search) {
  return `<li class="uk-active">
  <button class='historyButton uk-button uk-button-link' data-location='${search}'>${search}</button>
  </li>
  `;
}
// on click of button item in dropdown
historyDropdown.on("click", function (event) {
  // each button has data location, sets data to search box val and create click
  let historyData = event.target.getAttribute("data-location");
  citySearch.val(historyData);
  $(".search-filter").click();
});

//Alert to create a pop up to suggest changes to the edit
function badSearch() {
return `<div uk-alert class="uk-text-center">
<a class="uk-alert-close" uk-close></a>
<h3 class="">Notice</h3>
<p>Sorry...</p>
<p>The city you are searching for was not found.</p>
</div>`
}

function badSearchReturn(){
 let badSearchText =  badSearch()
 //Add the bad search text
$("#alert-box").html(badSearchText)
//Clears the map
$("#map").attr("style","display:none")

}

 
// each cuisine button has data corresponding to cuisine ID search in API
$("#cuisine-container button").click(function () {
  let cuisineData = $(this).attr("data-cuisine");
  console.log(cuisineData);
  if (cuisineData && currentCityID) {
    developedRestaurantSearch(currentCityID, cuisineData);
  }
});

// API search that uses cuisine ID and City ID
const developedSearchStart =
  "https://developers.zomato.com/api/v2.1/search?entity_id=";
const developedSearchEnd = "&entity_type=city&count=10&sort=rating&order=desc";

function developedRestaurantSearch(cityOutput, cuisineID) {
  clearDisplay();
  clearAlert();
  const cuisineSearch = "&cuisines=" + cuisineID;
  $.ajax({
    url:
      developedSearchStart +
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
    let restaurantName = [];
    let restaurantAdrress = []
    // for each restaurant in the best restaurant array
    bestRestaurants.forEach(({ restaurant }) => {
      restaurantDisplay.append(createCard(restaurant));
      lat.push(Number(restaurant.location.latitude));
      lon.push(Number(restaurant.location.longitude));
      location.push(restaurant.location.locality);
      restaurantName.push(restaurant.name);
      restaurantAdrress.push(restaurant.location.address)
      initMap(lat, lon, location,restaurantName,restaurantAdrress); 
 
    });
    // animates cards to look nicer
    $(".animate-fade-in").fadeIn(1000);
  });
}

// inner HTML for each card, template literals used to navigate array
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
							<p class="uk-text-small uk-text-muted address-height"id="text">${
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

// reduces cuisines to 3 in card
function reduceCuisines(cuisines, amount) {
  return cuisines.split(",").splice(0, amount);
}

// pound sign representing price for two
function priceCalculator(priceForTwo) {
  if (priceForTwo <= 40) {
    return "£";
  } else if (priceForTwo < 60) {
    return "££";
  } else {
    return "£££";
  }
}

// placeholder Image for cards that have no image
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
//clear the bad search box
function clearAlert(){
  $("#alert-box").html("")
}

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
$(".reset").click(function () {
  clearDisplay();
  hideSection();
  addPlaceholder();
  clearSearchField();
});

function initMap(lati, long, tit, restaurantName,restaurantAdrress) {
   
  // The location of restaurants
  let text = `\nClick on me to open the directions in google maps.`;
  const place = {
    lat: lati[0],
    lng: long[0],
  };
  // The map, centered at restaurants
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: place,
  });
  document.querySelector("#map").style.display = "block";
  // The marker, positioned at restaurants
  for (let count = 0; count < lati.length; count++) {
    const marker = new google.maps.Marker({
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(lati[count], long[count]),
      map: map,
      title: restaurantName[count] + text,
    });
    console.log(restaurantName[0]);
    let infowindow = new google.maps.InfoWindow({
      content: `<span class="cat-txt">${restaurantName[count]}</span>
    <br>
    <span class='cat-txt'>${restaurantAdrress[count]}</span>
    <br>
    <a id = "Direction" target="_blank" href='https://www.google.com/maps/search/?api=1&query=${lati[count]},${long[count]}'>Directions</a>
    `,
    });
    marker.addListener("click", () => {
      infowindow.open(map, marker);
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    });
  }
}