window.addEventListener("load", () => {
  const cityInput = document.getElementById("city");
  const searchBtn = document.getElementById("search-btn");
  
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    const { latitude, longitude } = coords;
    fetchAllergyRisk(latitude, longitude);
    reverseGeocode(latitude, longitude, city => {
      cityInput.placeholder = city ? `Miestas: ${city}` : "Įvesk miestą";
    });
  }, () => {
    cityInput.placeholder = "Įvesk miestą";
  });
  
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value;
    if (city) {
      searchCity(city);
    }
  });
});

function fetchAllergyRisk(latitude, longitude) {
  const url = `https://www.pollenwarndienst.at/index.php?eID=appinterface&action=getHourlyLoadData&type=gps&value%5Blatitude%5D=${latitude}&value%5Blongitude%5D=${longitude}&lang_code=en&lang_id=1&pure_json=1&cordova=1&pasyfo=1`;
  
  console.log(`URL: ${url}`);
  
  fetch(url)
    .then(response => response.json())
    .then(({ result }) => {
      const allergyRisk = result && result.total;
      
      if (allergyRisk === undefined) {
        throw new Error("No data available");
      }
      
      const color = allergyRisk <= 3 ? "green" : allergyRisk <= 6 ? "orange" : "red";
      
      document.getElementById("allergy-risk").innerHTML = `
        Alergijos rizika: <span class="${color}">${allergyRisk}</span>
      `;
    })
    .catch(error => {
      document.getElementById("allergy-risk").innerHTML = `Error: ${error.message}`;
      document.getElementById("allergy-risk").classList.remove("green", "orange", "red");
    });
}

function searchCity(city) {
  const url = `https://nominatim.openstreetmap.org/search.php?q=${city}&format=json`;
  
  fetch(url)
    .then(response => response.json())
    .then(([ data ]) => {
      if (data) {
        const { lat, lon } = data;
        fetchAllergyRisk(lat, lon);
        reverseGeocode(lat, lon, city => {
          document.getElementById("city").placeholder = `Which city: ${city}`;
        });
      } else {
        throw new Error("Miestas nerastas");
      }
    })
    .catch(error => {
      document.getElementById("allergy-risk").innerHTML = `Error: ${error.message}`;
      document.getElementById("allergy-risk").style.backgroundImage = "none";
    });
}

function reverseGeocode(latitude, longitude, callback) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

  fetch(url)
    .then(response => response.json())
    .then(({ address }) => {
      const city = address.city || address.town || address.village || address.hamlet;
      console.log(`City: ${city}`);
      callback(city);
    })
    .catch(console.log);
}
