const services = [
    // Sample data
    { name: "Service 1", description: "Description of Service 1", link: "https://example.com/1" },
    { name: "Service 2", description: "Description of Service 2", link: "https://example.com/2" },
    // Add more services here
];

let currentPage = 1;
const itemsPerPage = 10;

function displayServices(servicesToDisplay) {
    const serviceList = document.getElementById('service-list');
    serviceList.innerHTML = '';

    servicesToDisplay.forEach(service => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${service.name}</strong><p>${service.description}</p><a href="${service.link}" target="_blank">Visit</a>`;
        serviceList.appendChild(listItem);
    });
}

function setupPagination(services) {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(services.length / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            paginateServices();
        });
        paginationControls.appendChild(pageButton);
    }
}

function paginateServices() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    displayServices(services.slice(start, end));
}

function searchServices(query) {
    const filteredServices = services.filter(service => service.name.toLowerCase().includes(query.toLowerCase()));
    displayServices(filteredServices.slice(0, itemsPerPage));
    setupPagination(filteredServices);
}

document.getElementById('search-bar').addEventListener('input', (event) => {
    searchServices(event.target.value);
});

paginateServices();
setupPagination(services);
