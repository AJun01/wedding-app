
const budgetSlider = document.getElementById('budget-slider');
const budgetValue = document.getElementById('budget-value');

budgetSlider.addEventListener('input', () => {
    budgetValue.textContent = budgetSlider.value;
    localStorage.setItem('weddingBudget', budgetSlider.value);
});


if (localStorage.getItem('weddingBudget')) {
    budgetSlider.value = localStorage.getItem('weddingBudget');
    budgetValue.textContent = budgetSlider.value;
}


const guestForm = document.getElementById('guest-form');
const guestList = document.getElementById('guest-list');

let guests = JSON.parse(localStorage.getItem('guests')) || [];

function renderGuestList() {
    guestList.innerHTML = '';
    guests.forEach((guest, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${guest.fullName} (${guest.numberOfPeople} people) - ${guest.email} - ${guest.phoneNumber} - Estimated Cost: $${guest.estimatedCost}
            <button onclick="editGuest(${index})">Edit</button>
            <button onclick="deleteGuest(${index})">Delete</button>
        `;
        guestList.appendChild(li);
    });
}

guestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const numberOfPeople = parseInt(document.getElementById('guest-number').value);
    if (numberOfPeople > 2) {
        alert('Number of people cannot exceed 2');
        return;
    }
    const fullName = document.getElementById('guest-name').value;
    const email = document.getElementById('guest-email').value;
    const phoneNumber = document.getElementById('guest-phone').value;
    const estimatedCost = parseFloat(document.getElementById('guest-cost').value);

    guests.push({ numberOfPeople, fullName, email, phoneNumber, estimatedCost });
    localStorage.setItem('guests', JSON.stringify(guests));
    renderGuestList();
    guestForm.reset();
});

function deleteGuest(index) {
    guests.splice(index, 1);
    localStorage.setItem('guests', JSON.stringify(guests));
    renderGuestList();
}

function editGuest(index) {
    const guest = guests[index];
    document.getElementById('guest-number').value = guest.numberOfPeople;
    document.getElementById('guest-name').value = guest.fullName;
    document.getElementById('guest-email').value = guest.email;
    document.getElementById('guest-phone').value = guest.phoneNumber;
    document.getElementById('guest-cost').value = guest.estimatedCost;

    guests.splice(index, 1);
    localStorage.setItem('guests', JSON.stringify(guests));
    renderGuestList();
}


renderGuestList();


const dinnerForm = document.getElementById('dinner-form');

let dinnerOptions = JSON.parse(localStorage.getItem('dinnerOptions')) || {
    vegan: 0,
    meatLovers: 0,
    seafoodLovers: 0
};

document.getElementById('vegan-cost').value = dinnerOptions.vegan;
document.getElementById('meat-cost').value = dinnerOptions.meatLovers;
document.getElementById('seafood-cost').value = dinnerOptions.seafoodLovers;

dinnerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    dinnerOptions.vegan = parseFloat(document.getElementById('vegan-cost').value);
    dinnerOptions.meatLovers = parseFloat(document.getElementById('meat-cost').value);
    dinnerOptions.seafoodLovers = parseFloat(document.getElementById('seafood-cost').value);

    localStorage.setItem('dinnerOptions', JSON.stringify(dinnerOptions));
    alert('Dinner options updated');
});

const locationForm = document.getElementById('location-form');
const deleteLocationBtn = document.getElementById('delete-location');
const aerialViewContainer = document.getElementById('aerial-view-container');

let weddingLocation = JSON.parse(localStorage.getItem('weddingLocation')) || {
  address: '',
  estimatedCost: 0,
  addressComponents: {}
};

function getAddressString() {
  const street = document.getElementById('location-address').value;
  const city = document.getElementById('location-city').value;
  const state = document.getElementById('location-state').value;
  const zip = document.getElementById('location-zip').value;

  let address = `${street}, ${city}`;
  if (state) address += `, ${state}`;
  if (zip) address += `, ${zip}`;

  return address;
}

function loadLocation() {
  if (weddingLocation.address) {
    const addressComponents = weddingLocation.addressComponents;
    document.getElementById('location-address').value = addressComponents.street;
    document.getElementById('location-city').value = addressComponents.city;
    document.getElementById('location-state').value = addressComponents.state;
    document.getElementById('location-zip').value = addressComponents.zip;
    document.getElementById('location-cost').value = weddingLocation.estimatedCost;
    initAerialView(weddingLocation.address);
  }
}

locationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const addressComponents = {
    street: document.getElementById('location-address').value,
    city: document.getElementById('location-city').value,
    state: document.getElementById('location-state').value,
    zip: document.getElementById('location-zip').value,
  };
  const addressString = getAddressString();

  weddingLocation.address = addressString;
  weddingLocation.addressComponents = addressComponents;
  weddingLocation.estimatedCost = parseFloat(document.getElementById('location-cost').value);

  localStorage.setItem('weddingLocation', JSON.stringify(weddingLocation));
  alert('Location updated');
  initAerialView(addressString);
});

deleteLocationBtn.addEventListener('click', () => {
  weddingLocation = { address: '', estimatedCost: 0, addressComponents: {} };
  localStorage.removeItem('weddingLocation');
  document.getElementById('location-address').value = '';
  document.getElementById('location-city').value = '';
  document.getElementById('location-state').value = '';
  document.getElementById('location-zip').value = '';
  document.getElementById('location-cost').value = '';
  aerialViewContainer.style.display = 'none';
  alert('Location deleted');
});

async function initAerialView(address) {
  const displayEl = document.querySelector('.aerial-view-media');
  displayEl.addEventListener('click', function () {
    if (displayEl.paused) {
      displayEl.play();
    } else {
      displayEl.pause();
    }
  });

  const API_KEY = process.env.GOOGLE_API_KEY;

  const encodedAddress = encodeURIComponent(address);

  const apiUrl = `https://aerialview.googleapis.com/v1/videos:lookupVideo?key=${API_KEY}&address=${encodedAddress}`;

  try {
    const response = await fetch(apiUrl);
    const videoResult = await response.json();

    if (videoResult.state === 'PROCESSING') {
      alert('Video is still processing. Please try again later.');
      aerialViewContainer.style.display = 'none';
    } else if (videoResult.error && videoResult.error.code === 404) {
      alert('Video not found. The Aerial View may not be available for this location.');
      aerialViewContainer.style.display = 'none';
    } else {
      displayEl.src = videoResult.uris.MP4_MEDIUM.landscapeUri;
      aerialViewContainer.style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching aerial view:', error);
    alert('An error occurred while fetching the aerial view.');
    aerialViewContainer.style.display = 'none';
  }
}

loadLocation();

const photographerForm = document.getElementById('photographer-form');

let photographer = JSON.parse(localStorage.getItem('photographer')) || {
    name: '',
    email: '',
    phoneNumber: '',
    cost: 0
};

function loadPhotographer() {
    if (photographer.name) {
        document.getElementById('photographer-name').value = photographer.name;
        document.getElementById('photographer-email').value = photographer.email;
        document.getElementById('photographer-phone').value = photographer.phoneNumber;
        document.getElementById('photographer-cost').value = photographer.cost;
    }
}

photographerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    photographer.name = document.getElementById('photographer-name').value;
    photographer.email = document.getElementById('photographer-email').value;
    photographer.phoneNumber = document.getElementById('photographer-phone').value;
    photographer.cost = parseFloat(document.getElementById('photographer-cost').value);

    localStorage.setItem('photographer', JSON.stringify(photographer));
    alert('Photographer details updated');
});

loadPhotographer();