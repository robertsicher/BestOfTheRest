const apiKey = "&apikey=b718873bcc30e1bfc3eb75f18f1a3f5a"
const queryUrlLocation = "https://developers.zomato.com/api/v2.1/locations?query="
const locations = "London"

$.ajax({
    url: queryUrlLocation + locations + apiKey
}).then(locationDetails).catch(error)
            
function locationDetails(response){
    console.log(response.location_suggestions[0].entity_type)
    const entity_type = response.location_suggestions[0].entity_type
    const entity_id =  response.location_suggestions[0].entity_id
    const queryUrlLocationDetails = "https://developers.zomato.com/api/v2.1/location_details?entity_id="

    $.ajax({
        url: queryUrlLocationDetails + entity_id + "&entity_type=" + entity_type + apiKey 
        }).then(restaurant).catch(error)
}

function restaurant(data){
    const resturantTopRatedId = data.nearby_res
    const queryUrlResturant = "https://developers.zomato.com/api/v2.1/restaurant?res_id="
    for(let i = 0 ; i < resturantTopRatedId.length;i++ ){
         $.ajax({
            url: queryUrlResturant + resturantTopRatedId[i] + apiKey 
        }).then(show).catch(error)
    }    
}

function show(data){
    console.log(data.name)
}

function error(error){
    console.log(error)
}