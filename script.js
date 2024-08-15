let data = {};

function fetchData() {
    fetch('services.json')
        .then(response => response.json())
        .then(json => {
            data = json.categories;
            populateCategories();
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function populateCategories() {
    const categories = Object.keys(data);
    const table = document.getElementById('links-table');
    table.innerHTML = '';

    categories.forEach(category => {
        const headerRow = `<tr class="table-secondary"><th colspan="3">${category}</th></tr>`;
        table.innerHTML += headerRow;

        data[category].forEach(item => {
            const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.link}" target="_blank">${item.link}</a></td>
                </tr>
            `;
            table.innerHTML += row;
        });
    });
}

function searchTable() {
    const input = document.getElementById("search").value.toLowerCase();
    const table = document.getElementById('links-table');
    table.innerHTML = '';

    const filteredData = [];

    Object.keys(data).forEach(category => {
        // Check if category matches the search input
        if (category.toLowerCase().includes(input)) {
            // Add all items in this category if category matches
            filteredData.push({ category: category, items: data[category] });
        } else {
            // Filter items within the category
            const matchingItems = data[category].filter(item =>
                item.name.toLowerCase().includes(input) ||
                item.description.toLowerCase().includes(input) ||
                item.link.toLowerCase().includes(input)
            );

            if (matchingItems.length > 0) {
                filteredData.push({ category: category, items: matchingItems });
            }
        }
    });

    // Display filtered results
    filteredData.forEach(group => {
        const headerRow = `<tr class="table-secondary"><th colspan="3">${group.category}</th></tr>`;
        table.innerHTML += headerRow;

        group.items.forEach(item => {
            const row = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.link}" target="_blank">${item.link}</a></td>
                </tr>
            `;
            table.innerHTML += row;
        });
    });
}

document.getElementById("search").addEventListener("input", searchTable);

function acceptCookies() {
    document.querySelector('.cookie-consent').style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
}

window.onload = function() {
    fetchData();

    if (!localStorage.getItem('cookiesAccepted')) {
        document.querySelector('.cookie-consent').classList.add('show');
    }
};
