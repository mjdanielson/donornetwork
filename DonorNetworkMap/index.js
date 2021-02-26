let geocoderDiv = document.getElementById("geocoder");
let hoveredCountyId = null;

mapboxgl.accessToken =
  "pk.eyJ1IjoibWpkYW5pZWxzb24iLCJhIjoiY2s5bTJodXluMHVhYTNybWk1eTMxN2lidiJ9.DU-KkKoefUHAlSidTjqsiQ";
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mjdanielson/cklh54ve0031n18sk666l6htj",
  center: [-89.6045, 44.76234],
  zoom: 6.5,
});

let geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
});

geocoderDiv.appendChild(geocoder.onAdd(map));

//CSV link
const csvUrl = "/assets/data/Wisconsin_Data_Test.csv";
const csvPromise = papaPromise(csvUrl);

map.on("load", function () {
  csvPromise.then(function (results) {
    results.data.forEach((row) => {
      map.setFeatureState(
        {
          //Source tileset and source layer
          source: "wi_counties-0pve9b",
          sourceLayer: "wi_counties-0pve9b",
          //Unqiue ID row name for data join
          id: row.county_nam,
        },
        //Row(s) to style/interact with
        {
          num_donor: row.num_donors,
        }
      );
    });
  });

  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  //Add source layer
  map.addSource("wi_counties-0pve9b", {
    type: "vector",
    url: "mapbox://mjdanielson.dlg5bhua",
    promoteId: "county_nam",
  });

  //Add county data as fill and line layers

  map.addLayer(
    {
      id: "wi-district-fill",
      type: "fill",
      source: "wi_counties-0pve9b",
      "source-layer": "wi_counties-0pve9b",
      layout: {},
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["feature-state", "num_donor"],
          1,
          "#e784f0",
          9.875,
          "#bb74f1",
          18.75,
          "#a46af1",
          36.5,
          "#895ff1",
          54.25,
          "#6a55f1",
          72,
          "#6a55f1",
        ],
        "fill-opacity": 0.8,
      },
    },
    firstSymbolId
  );

  map.addLayer(
    {
      id: "wi-district-line",
      type: "line",
      source: "wi_counties-0pve9b",
      "source-layer": "wi_counties-0pve9b",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "black",
          "#D8CAC1",
        ],
        "line-width": 1,
      },
    },
    firstSymbolId
  );

  // When the user moves their mouse over the wi-district-line layer, we'll update the
  // feature state for the feature under the mouse.
  map.on("mousemove", "wi-district-line", function (e) {
    if (e.features.length > 0) {
      if (hoveredCountyId) {
        map.setFeatureState(
          {
            source: "wi_counties-0pve9b",
            sourceLayer: "wi_counties-0pve9b",
            id: hoveredCountyId,
          },
          { hover: false }
        );
      }
      hoveredCountyId = e.features[0].properties.id;
      console.log(hoveredCountyId);
      map.setFeatureState(
        {
          source: "wi_counties-0pve9b",
          sourceLayer: "wi_counties-0pve9b",
          id: hoveredCountyId,
        },
        { hover: true }
      );
    }
  });

  // When the mouse leaves the wi-district-line layer, update the feature state of the
  // previously hovered feature.
  map.on("mouseleave", "wi-district-line", function () {
    if (hoveredCountyId) {
      map.setFeatureState(
        {
          source: "wi_counties-0pve9b",
          sourceLayer: "wi_counties-0pve9b",
          id: hoveredCountyId,
        },
        { hover: false }
      );
    }
    hoveredStateId = null;
  });
});

function papaPromise(url) {
  return new Promise(function (resolve, reject) {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      dynamicTyping: true,
    });
  });
}

//Add counties to drop down menu

let countyNames = [
  "Kenosha",
  "Racine",
  "Iowa",
  "Milwaukee",
  "Grant",
  "Crawford",
  "Richland",
  "Polk",
  "Marinette",
  "Florence",
  "Forest",
  "Burnett",
  "Iron",
  "Ozaukee",
  "Dodge",
  "Sauk",
  "Columbia",
  "Sheboygan",
  "La Crosse",
  "Juneau",
  "Adams",
  "Manitowoc",
  "Trempealeau",
  "Buffalo",
  "Brown",
  "Kewaunee",
  "Pierce",
  "Dunn",
  "Door",
  "Oconto",
  "Lincoln",
  "Jefferson",
  "Fond du Lac",
  "Rock",
  "Waukesha",
  "Lafayette",
  "Winnebago",
  "Washington",
  "Walworth",
  "Green",
  "Dane",
  "Marquette",
  "Calumet",
  "Vernon",
  "Green Lake",
  "Monroe",
  "Menominee",
  "Waushara",
  "Outagamie",
  "Wood",
  "Waupaca",
  "Jackson",
  "Portage",
  "Eau Claire",
  "Pepin",
  "Shawano",
  "Clark",
  "Marathon",
  "Langlade",
  "Saint Croix",
  "Chippewa",
  "Taylor",
  "Rusk",
  "Barron",
  "Oneida",
  "Price",
  "Sawyer",
  "Washburn",
  "Vilas",
  "Ashland",
  "Douglas",
  "Bayfield",
];

// csvResults.forEach((elem) => console.log(elem));
let selectList = document.getElementById("select");

const buildCountySelectors = (data) => {
  data.sort();
  countyNames.forEach((countyName) => {
    let option = document.createElement("option");
    option.value = countyName;
    option.text = countyName;
    selectList.appendChild(option);
  });
};

buildCountySelectors(countyNames);
// countyNames.forEach((countyName) =>

// document.createElement('option'))
// console.log(csvResults);
