let sections = [];
let currentPage = 1;
const itemsPerPage = 10;

// Fetch services data from the JSON file
fetch('services.json')
    .then(response => response.json())
    .then(data => {
        sections = data.sections;
        populateTOC();
        paginateServices();
    })
    .catch(error => console.error('Error fetching services:', error));

function populateTOC() {
    const toc = document.getElementById('toc');
    sections.forEach((section, index) => {
        const tocItem = document.createElement('li');
        tocItem.innerHTML = `<a href="#section-${index}">${section.name}</a>`;
        toc.appendChild(tocItem);
    });
}

function displayServices(servicesToDisplay) {
    const serviceSections = document.getElementById('service-sections');
    serviceSections.innerHTML = '';

    servicesToDisplay.forEach((section, index) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'service-section';
        sectionElement.id = `section-${index}`;
        sectionElement.innerHTML = `<h3>${section.name}</h3>`;

        const sectionList = document.createElement('ul');
        section.items.forEach(service => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${service.name}</strong><p>${service.description}</p><a href="${service.link}" target="_blank">Visit</a>`;
            sectionList.appendChild(listItem);
        });
        sectionElement.appendChild(sectionList);
        serviceSections.appendChild(sectionElement);
    });
}

function paginateServices() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    displayServices(sections.slice(start, end));
}

function searchServices(query) {
    const filteredSections = sections.map(section => {
        return {
            name: section.name,
            items: section.items.filter(service => service.name.toLowerCase().includes(query.toLowerCase()))
        };
    }).filter(section => section.items.length > 0);

    displayServices(filteredSections);
}

document.getElementById('search-bar').addEventListener('input', (event) => {
    searchServices(event.target.value);
});

// Cookie Popup
const cookiePopup = document.getElementById('cookie-popup');
const acceptCookiesButton = document.getElementById('accept-cookies');

acceptCookiesButton.addEventListener('click', () => {
    cookiePopup.style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
});

if (!localStorage.getItem('cookiesAccepted')) {
    cookiePopup.style.display = 'flex';
} else {
    cookiePopup.style.display = 'none';
}
