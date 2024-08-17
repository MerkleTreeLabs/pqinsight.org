// Global Variables
let data = {};
let expandedCategories = new Set();
let sortOrder = { name: true, description: true, link: true, date: true };

// Initialize the site when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    applySavedTheme();
    fetchData();
    setupEventListeners();
    if (!localStorage.getItem('cookiesAccepted')) {
        document.querySelector('.cookie-consent').classList.add('show');
    } else {
        highlightViewedLinks();
    }
});

// Fetch JSON data and initialize table
function fetchData() {
    fetch('services.json')
        .then(response => response.json())
        .then(json => {
            data = json.categories;
            sortCategories('name', true);
            populateCategories();
            expandAllCategories();
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

// Populate the table with categories and items
function populateCategories() {
    const tableBody = document.querySelector('#links-table tbody');
    tableBody.innerHTML = '';  // Clear table body

    Object.entries(data).forEach(([category, items]) => {
        const normalizedCategory = normalizeCategory(category);
        tableBody.innerHTML += createCategoryHeaderRow(category, normalizedCategory);

        items.forEach(item => {
            tableBody.innerHTML += createItemRow(item, normalizedCategory);
        });
    });

    // Reapply event listeners after updating the table
    addCategoryClickHandlers();
    highlightViewedLinks();
}

// Create category header row HTML
function createCategoryHeaderRow(category, normalizedCategory) {
    return `
        <tr class="table-secondary category-header" data-category="${normalizedCategory}">
            <th colspan="4">${category}</th>
        </tr>`;
}

// Create item row HTML
function createItemRow(item, normalizedCategory) {
    const dateCell = item.date && item.date !== "01/01/1970" ? `<td>${item.date}</td>` : '<td></td>';
    return `
        <tr class="category-item ${normalizedCategory}">
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td><a href="${item.link}" target="_blank">${item.link}</a></td>
            ${dateCell}
        </tr>`;
}

// Normalize category names
function normalizeCategory(category) {
    return category.replace(/\s+/g, '-').toLowerCase();
}

// Add event listeners for category headers
function addCategoryClickHandlers() {
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const category = header.getAttribute('data-category');
            toggleCategory(category);
        });
    });
}

// Toggle visibility of category items
function toggleCategory(category) {
    const items = document.querySelectorAll(`.category-item.${category}`);
    const isExpanded = expandedCategories.has(category);
    items.forEach(item => item.style.display = isExpanded ? 'none' : 'table-row');
    isExpanded ? expandedCategories.delete(category) : expandedCategories.add(category);
}

// Set up global event listeners
function setupEventListeners() {
    document.getElementById('expandAll').addEventListener('click', expandAllCategories);
    document.getElementById('collapseAll').addEventListener('click', collapseAllCategories);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById("search").addEventListener("input", searchTable);
}

// Expand all categories
function expandAllCategories() {
    expandedCategories = new Set(Object.keys(data).map(normalizeCategory));
    document.querySelectorAll('.category-item').forEach(item => item.style.display = 'table-row');
}

// Collapse all categories
function collapseAllCategories() {
    expandedCategories.clear();
    document.querySelectorAll('.category-item').forEach(item => item.style.display = 'none');
}

// Sort categories by a specific column
function sortCategories(column, ascending) {
    Object.keys(data).forEach(category => {
        data[category].sort((a, b) => compareItems(a, b, column, ascending));
    });
    populateCategories();
}

// Compare function for sorting
function compareItems(a, b, column, ascending) {
    const valueA = a[column] ? a[column].toLowerCase() : '';
    const valueB = b[column] ? b[column].toLowerCase() : '';

    if (column === 'date' && valueA && valueB) {
        return ascending ? new Date(valueA) - new Date(valueB) : new Date(valueB) - new Date(valueA);
    }

    return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
}

// Highlight viewed links based on stored data
function highlightViewedLinks() {
    const viewedLinks = JSON.parse(getCookie('viewedLinks') || '[]');
    document.querySelectorAll('.category-item a').forEach(link => {
        if (viewedLinks.includes(link.href)) {
            link.closest('tr').classList.add('viewed');
        }
    });
}

// Search the table based on user input
function searchTable() {
    const input = document.getElementById("search").value.toLowerCase();
    const tableBody = document.querySelector('#links-table tbody');
    tableBody.innerHTML = ''; // Clear existing table content

    Object.entries(data).forEach(([category, items]) => {
        const matchingItems = items.filter(item => 
            item.name.toLowerCase().includes(input) || 
            item.description.toLowerCase().includes(input) ||
            item.link.toLowerCase().includes(input)
        );

        if (matchingItems.length > 0) {
            const normalizedCategory = normalizeCategory(category);
            tableBody.innerHTML += createCategoryHeaderRow(category, normalizedCategory);
            matchingItems.forEach(item => {
                tableBody.innerHTML += createItemRow(item, normalizedCategory);
            });
        }
    });

    addCategoryClickHandlers(); // Reapply click handlers after search
}

// Cookie handling functions
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// Handle theme toggling and saving preference
function toggleTheme() {
    const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    setTheme(newTheme);
    setCookie('theme', newTheme, 365);
}

// Set the theme based on user preference
function setTheme(theme) {
    document.body.classList.toggle('dark-mode', theme === 'dark');
}

// Apply saved theme on page load
function applySavedTheme() {
    const savedTheme = getCookie('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    }
}

// Utility to copy text to clipboard
function copyToClipboard(id) {
    const copyText = document.getElementById(id);
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");
    alert(`Copied the address: ${copyText.value}`);
}

// Close banner function
function closeBanner() {
    document.getElementById('pqcBanner').style.display = 'none';
}

// Accept cookies function
function acceptCookies() {
    document.querySelector('.cookie-consent').style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
}
function rejectCookies() {
    document.querySelector('.cookie-consent').classList.remove('show');
    localStorage.setItem('cookiesAccepted', 'false');
}