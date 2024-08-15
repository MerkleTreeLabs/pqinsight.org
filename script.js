let data = {};
let expandedCategories = new Set();  // Set to track expanded categories

function fetchData() {
    fetch('services.json')
        .then(response => response.json())
        .then(json => {
            data = json.categories;
            populateCategories();
            expandAllCategories();  // Automatically expand all categories on load
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function populateCategories() {
    const categories = Object.keys(data);
    const table = document.getElementById('links-table');
    table.innerHTML = `
        <tr>
            <td colspan="4">
                <button id="expandAll" class="btn btn-sm btn-primary">+</button>
                <button id="collapseAll" class="btn btn-sm btn-primary">-</button>
            </td>
        </tr>`;  // Add buttons to expand/collapse all

    categories.forEach(category => {
        const headerRow = `<tr class="table-secondary category-header" data-category="${category}"><th colspan="4">${category}</th></tr>`;
        table.innerHTML += headerRow;

        data[category].forEach(item => {
            let dateCell = '';
            if (item.date && item.date !== "01/01/1970") {
                dateCell = `<td>${item.date}</td>`;
            } else {
                dateCell = `<td></td>`;  // Empty cell if no valid date
            }

            const row = `
                <tr class="category-item ${category}">
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
    expandedCategories = new Set(Object.keys(data));  // Mark all categories as expanded
}

function collapseAllCategories() {
    const items = document.querySelectorAll('.category-item');
    items.forEach(item => item.style.display = 'none');
    expandedCategories.clear();  // Clear all expanded categories
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
    const table = document.getElementById('links-table');
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
        const headerRow = `<tr class="table-secondary category-header" data-category="${group.category}"><th colspan="4">${group.category}</th></tr>`;
        table.innerHTML += headerRow;

        group.items.forEach(item => {
            let dateCell = '';
            if (item.date && item.date !== "01/01/1970") {
                dateCell = `<td>${item.date}</td>`;
            } else {
                dateCell = `<td></td>`;
            }

            const row = `
                <tr class="category-item ${group.category}">
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
