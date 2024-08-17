// *This is the js code for mapbox to pin point location on maps, zoom etc 
mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    //? We are also able to change the style of the map by changes the style field below "streets-v12" you can view this in docs.  
    style: 'mapbox://styles/mapbox/dark-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
    )
    .addTo(map)

//* there is a thing called popup which will show a pop when hover over maker but for that we need the campground title and location which is
//*  not able to access in this point in time as due to a error in ejs so we will just comment it 