let hoveredCountyId = null;

mapboxgl.accessToken =
  "pk.eyJ1IjoibWpkYW5pZWxzb24iLCJhIjoiY2s5bTJodXluMHVhYTNybWk1eTMxN2lidiJ9.DU-KkKoefUHAlSidTjqsiQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mjdanielson/cklh54ve0031n18sk666l6htj",
  center: [-89.6045, 44.76234],
  zoom: 6.5,
});

//CSV link
const csvUrl = "assets/data/Versiti_Registrations.csv";
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
          id: row.County,
        },
        //Row(s) to style/interact with
        {
          num_donor: row.Registrations,
        }
      );
    });
  });

  const layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  let firstSymbolId;
  for (let i = 0; i < layers.length; i++) {
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
          0,
          "#a9abab",
          1,
          "#fad249",
          10,
          "#fad249",
          40,
          "#e08438",
          70,
          "#ce3669",
          99,
          "#ce3669",
          100,
          "#883057",
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
        "line-width": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          3.5,
          0.75,
        ],
      },
    },
    firstSymbolId
  );

  // When the user moves their mouse over the wi-district-fill layer, we'll update the
  // feature state for the feature under the mouse.
  map.on("mousemove", "wi-district-fill", function (e) {
    if (e.features.length > 0) {
      selectCounty(e.features[0].id, e.features[0].state.num_donor);
    }
  });

  // When the mouse leaves the wi-district-fill layer, update the feature state of the
  // previously hovered feature.
  map.on("mouseleave", "wi-district-fill", function () {
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

let selectList = document.getElementById("select");
let modal = document.getElementById("countyDonors");
let countyData = [];

const onSelect = (e) => {
  let numDonors = 0;
  countyData.forEach((donor) => {
    if (e.target.value === donor.County) {
      numDonors = donor.Registrations;
    }
  });
  selectCounty(e.target.value, numDonors);
};

const highlightCounty = (id) => {
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
  hoveredCountyId = id;
  map.setFeatureState(
    {
      source: "wi_counties-0pve9b",
      sourceLayer: "wi_counties-0pve9b",
      id: hoveredCountyId,
    },
    { hover: true }
  );
  selectList.value = hoveredCountyId;
};

const selectCounty = (id, donors) => {
  if (donors <= 10 && donors >= 1) {
    donors = "1-10";
  }
  modal.innerHTML =
    `<span style= "font-weight:bold">` +
    `${id} County: ` +
    `</span>` +
    ` ${donors} people waiting`;
  highlightCounty(id);
};

csvPromise.then((data) => {
  // console.log(data);
  countyData = data.data;

  countyData.sort((a, b) => a.County.localeCompare(b.County));
  console.log(countyData);
  countyData.forEach((item) => {
    let option = document.createElement("option");
    option.id = item.Registrations;
    option.value = item.County;
    option.text = item.County;
    selectList.appendChild(option);
    selectList.onchange = onSelect;
  });
});
