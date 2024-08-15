let data = {};
let currentPage = 1;
const rowsPerPage = 5;

function fetchData() {
    fetch('services.json')
        .then(response => response.json())
        .then(json => {
            data = json.categories;
            displayTable(Object.values(data).flat());
            setupPagination(Object.values(data).flat());
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

/*
function displayTable(data) {
    const table = document.getElementById('links-table');
    table.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(item => {
        const row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td><a href="${item.link}" target="_blank">${item.link}</a></td>
            </tr>
        `;
        table.innerHTML += row;
    });
}
*/
function displayTable(data) {
    const table = document.getElementById('links-table');
    table.innerHTML = '';

    // Display all data without pagination
    data.forEach(item => {
        const row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td><a href="${item.link}" target="_blank">${item.link}</a></td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

function setupPagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const pageCount = Math.ceil(data.length / rowsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
}

function changePage(page) {
    currentPage = page;
    displayTable(Object.values(data).flat());
}

function sortTable(n) {
    const table = document.getElementById('links-table');
    let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc"; 

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function searchTable() {
    const input = document.getElementById("search").value.toLowerCase();
    const filteredData = Object.values(data).flat().filter(item => 
        item.name.toLowerCase().includes(input) ||
        item.description.toLowerCase().includes(input) ||
        item.link.toLowerCase().includes(input)
    );
    displayTable(filteredData);
   // setupPagination(filteredData);
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
