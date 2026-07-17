// Thay đổi link Web App Google Sheets của bạn vào đây (giữ nguyên dấu ngoặc kép)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZgDNYbtCkuYY1aIHcwCwmx83nDZsSj4miKMmReA7M8TTwOFL31qLkSELpEQfsiyR8/exec";

let allSnapshots = [];
let filteredSnapshots = [];

const tableBody = document.getElementById('snapshotTableBody');

// Các ô input lọc trên đầu cột
const filterClass = document.getElementById('filterClass');
const filterBuildName = document.getElementById('filterBuildName');
const filterSkillType = document.getElementById('filterSkillType');
const filterLink = document.getElementById('filterLink');

// 1. Tải dữ liệu từ Google Sheets
function loadSnapshots() {
    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            allSnapshots = data;
            filteredSnapshots = data;
            renderTable();
        })
        .catch(error => {
            console.error('Lỗi kết nối dữ liệu:', error);
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Không thể kết nối đến dữ liệu Google Sheets!</td></tr>';
        });
}

// 2. Vẽ bảng dữ liệu ra màn hình
function renderTable() {
    tableBody.innerHTML = '';
    
    if (filteredSnapshots.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #64748b;">Không tìm thấy kết quả phù hợp với bộ lọc.</td></tr>';
        return;
    }
    
    filteredSnapshots.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Tạo màu badge tương ứng cho từng Class cho chuyên nghiệp
        let classColorClass = `class-badge badge-${item.characterClass.toLowerCase()}`;
        
        row.innerHTML = `
            <td style="color: #64748b; font-weight: 500;">${index + 1}</td>
            <td><span class="${classColorClass}">${item.characterClass}</span></td>
            <td style="font-weight: 600; text-align: left !important; color: #fff;">${item.buildName}</td>
            <td><span class="skill-badge">${item.skillType}</span></td>
            <td style="text-align: left !important;">
                <a class="snapshot-link" href="${item.link}" target="_blank">🔗 ${item.link}</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 3. Hàm xử lý lọc đa cột thời gian thực
function applyFilters() {
    const valClass = filterClass.value.toUpperCase();
    const valBuildName = filterBuildName.value.toLowerCase().trim();
    const valSkillType = filterSkillType.value;
    const valLink = filterLink.value.toLowerCase().trim();
    
    filteredSnapshots = allSnapshots.filter(item => {
        const matchClass = (valClass === "" || item.characterClass === valClass);
        const matchBuildName = (valBuildName === "" || item.buildName.toLowerCase().includes(valBuildName));
        const matchSkillType = (valSkillType === "" || item.skillType === valSkillType);
        const matchLink = (valLink === "" || item.link.toLowerCase().includes(valLink));
        
        return matchClass && matchBuildName && matchSkillType && matchLink;
    });
    
    renderTable();
}

// Lắng nghe sự kiện người dùng tương tác với bộ lọc đầu cột
filterClass.addEventListener('change', applyFilters);
filterBuildName.addEventListener('input', applyFilters);
filterSkillType.addEventListener('change', applyFilters);
filterLink.addEventListener('input', applyFilters);

// Khởi chạy
loadSnapshots();
