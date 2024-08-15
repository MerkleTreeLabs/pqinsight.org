let data = {};
let expandedCategory = null;

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
        const headerRow = `<tr class="table-secondary category-header" data-category="${category}"><th colspan="3">${category}</th></tr>`;
        table.innerHTML += headerRow;

        data[category].forEach(item => {
            const row = `
                <tr class="category-item ${category}">
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.link}" target="_blank">${item.link}</a></td>
                </tr>
            `;
            table.innerHTML += row;
        });
    });

    addCategoryClickHandlers();
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
    
    if (expandedCategory === category) {
        // Collapse if the category is already expanded
        items.forEach(item => item.style.display = 'none');
        expandedCategory = null;
    } else {
        // Collapse the previously expanded category
        if (expandedCategory) {
            const previousItems = document.querySelectorAll(`.category-item.${expandedCategory}`);
            previousItems.forEach(item => item.style.display = 'none');
        }

        // Expand the selected category
        items.forEach(item => {
            item.style.display = 'table-row';
            markAsViewed(item); // Mark item as viewed
        });
        expandedCategory = category;
    }
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
        const headerRow = `<tr class="table-secondary category-header" data-category="${group.category}"><th colspan="3">${group.category}</th></tr>`;
        table.innerHTML += headerRow;

        group.items.forEach(item => {
            const row = `
                <tr class="category-item ${group.category}">
                    <td>${item.name}</td>
                    <td>${item.description}</td>
                    <td><a href="${item.link}" target="_blank">${item.link}</a></td>
                </tr>
            `;
            table.innerHTML += row;
        });
    });

    addCategoryClickHandlers();

    // Collapse all categories by default
    if (expandedCategory) {
        toggleCategory(expandedCategory);
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
        highlightViewedLinks(); // Highlight already viewed links
    }
};
