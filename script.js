let data = {};
let expandedCategories = new Set();  // Set to track expanded categories
let sortOrder = { name: true, description: true, link: true, date: true };  // Track sort order

function fetchData() {
    fetch('services.json')
        .then(response => response.json())
        .then(json => {
            data = json.categories;
            sortCategories('name', true); // Automatically sort by name (ascending)
            populateCategories();
            expandAllCategories();  // Automatically expand all categories on load
        })
        .catch(error => console.error('Error fetching JSON:', error));
}


function normalizeCategory(category) {
    return category.replace(/\s+/g, '-').toLowerCase();  // Replace spaces with hyphens and convert to lowercase
}

function populateCategories() {
    const categories = Object.keys(data);
    const table = document.getElementById('links-table').getElementsByTagName('tbody')[0]; // Reference to tbody only
    table.innerHTML = '';  // Clear only the tbody

    categories.forEach(category => {
        const normalizedCategory = normalizeCategory(category);
        const headerRow = `<tr class="table-secondary category-header" data-category="${normalizedCategory}"><th colspan="4">${category}</th></tr>`;
        table.innerHTML += headerRow;

        data[category].forEach(item => {
            let dateCell = '';
            if (item.date && item.date !== "01/01/1970") {
                dateCell = `<td>${item.date}</td>`;
            } else {
                dateCell = `<td></td>`;  // Empty cell if no valid date
            }

            const row = `
                <tr class="category-item ${normalizedCategory}">
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.link}" target="_blank">${item.link}</a></td>
                    ${dateCell}
                </tr>
            `;
            table.innerHTML += row;
        });
    });

    addCategoryClickHandlers();  // Ensure all categories have click handlers
    addGlobalToggleHandlers();   // Ensure global expand/collapse buttons work
    addSortHandlers();           // Add sorting functionality to headers
}

function addCategoryClickHandlers() {
    const headers = document.querySelectorAll('.category-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.getAttribute('data-category');
            toggleCategory(category);
        });
    });
}

function toggleCategory(category) {
    const items = document.querySelectorAll(`.category-item.${category}`);
    
    if (expandedCategories.has(category)) {
        // Collapse if the category is already expanded
        items.forEach(item => item.style.display = 'none');
        expandedCategories.delete(category);
    } else {
        // Expand the selected category
        items.forEach(item => item.style.display = 'table-row');
        expandedCategories.add(category);
    }
}

function addGlobalToggleHandlers() {
    document.getElementById('expandAll').addEventListener('click', () => {
        expandAllCategories();
    });

    document.getElementById('collapseAll').addEventListener('click', () => {
        collapseAllCategories();
    });
}

function expandAllCategories() {
    const items = document.querySelectorAll('.category-item');
    items.forEach(item => item.style.display = 'table-row');
    expandedCategories = new Set(Object.keys(data).map(normalizeCategory));  // Mark all categories as expanded
}

function collapseAllCategories() {
    const items = document.querySelectorAll('.category-item');
    items.forEach(item => item.style.display = 'none');
    expandedCategories.clear();  // Clear all expanded categories
}

function addSortHandlers() {
    const headers = document.querySelectorAll('.sortable');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            sortOrder[column] = !sortOrder[column];  // Toggle sort order
            sortCategories(column, sortOrder[column]);
        });
    });
}

function sortCategories(column, ascending) {
    Object.keys(data).forEach(category => {
        data[category].sort((a, b) => {
            let valueA = a[column] ? a[column].toLowerCase() : '';
            let valueB = b[column] ? b[column].toLowerCase() : '';

            if (column === 'date' && valueA && valueB) {
                return ascending ? new Date(valueA) - new Date(valueB) : new Date(valueB) - new Date(valueA);
            }

            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    });

    populateCategories();  // Re-render table with sorted data
}

function markAsViewed(item) {
    const link = item.querySelector('a').href;
    let viewedLinks = getCookie('viewedLinks');

    if (!viewedLinks) {
        viewedLinks = [];
    } else {
        viewedLinks = JSON.parse(viewedLinks);
    }

    if (!viewedLinks.includes(link)) {
        viewedLinks.push(link);
        setCookie('viewedLinks', JSON.stringify(viewedLinks), 365);
        item.classList.add('viewed');
    }
}

function searchTable() {
    const input = document.getElementById("search").value.toLowerCase();
    const table = document.getElementById('links-table').getElementsByTagName('tbody')[0];
    table.innerHTML = '';

    const filteredData = [];

    Object.keys(data).forEach(category => {
        if (category.toLowerCase().includes(input)) {
            filteredData.push({ category: category, items: data[category] });
        } else {
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

    filteredData.forEach(group => {
        const normalizedCategory = normalizeCategory(group.category);
        const headerRow = `<tr class="table-secondary category-header" data-category="${normalizedCategory}"><th colspan="4">${group.category}</th></tr>`;
        table.innerHTML += headerRow;

        group.items.forEach(item => {
            let dateCell = '';
            if (item.date && item.date !== "01/01/1970") {
                dateCell = `<td>${item.date}</td>`;
            } else {
                dateCell = `<td></td>`;
            }

            const row = `
                <tr class="category-item ${normalizedCategory}">
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.link}" target="_blank">${item.link}</a></td>
                    ${dateCell}
                </tr>
            `;
            table.innerHTML += row;
        });
    });

    addCategoryClickHandlers();  // Ensure search results are interactive

    if (expandedCategories.size > 0) {
        expandedCategories.forEach(category => toggleCategory(category));
    }
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

document.getElementById("search").addEventListener("input", searchTable);

function acceptCookies() {
    document.querySelector('.cookie-consent').style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
}

function highlightViewedLinks() {
    const viewedLinks = JSON.parse(getCookie('viewedLinks') || '[]');

    document.querySelectorAll('.category-item a').forEach(link => {
        if (viewedLinks.includes(link.href)) {
            link.closest('tr').classList.add('viewed');
        }
    });
}

window.onload = function() {
    fetchData();

    if (!localStorage.getItem('cookiesAccepted')) {
        document.querySelector('.cookie-consent').classList.add('show');
    } else {
        highlightViewedLinks();
    }
};
