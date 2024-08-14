// Example JSON data
const data = [
    {
        "title": "Google Chrome",
        "description": "Protecting Chrome Traffic with Hybrid Kyber KEM",
        "url": "https://blog.chromium.org/2023/08/protecting-chrome-traffic-with-hybrid.html"
    },
    {
        "title": "Example Link 2",
        "description": "OpenSSH 9.0 using the hybrid Streamlined NTRU Prime + x25519 key exchange method by default",
        "url": "https://www.openssh.com/txt/release-9.0"
    }
    // Add more data as needed
];

let currentPage = 1;
const rowsPerPage = 5;

function displayTable(data) {
    const table = document.getElementById('links-table');
    table.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(item => {
        const row = `
            <tr>
                <td>${item.title}</td>
                <td>${item.description}</td>
                <td><a href="${item.url}" target="_blank">${item.url}</a></td>
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
    displayTable(data);
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
    const filteredData = data.filter(item => 
        item.title.toLowerCase().includes(input) ||
        item.description.toLowerCase().includes(input) ||
        item.url.toLowerCase().includes(input)
    );
    displayTable(filteredData);
    setupPagination(filteredData);
}

document.getElementById("search").addEventListener("input", searchTable);

function acceptCookies() {
    document.querySelector('.cookie-consent').style.display = 'none';
    localStorage.setItem('cookiesAccepted', 'true');
}

window.onload = function() {
    displayTable(data);
    setupPagination(data);

    if (!localStorage.getItem('cookiesAccepted')) {
        document.querySelector('.cookie-consent').classList.add('show');
    }
};
