// Thay đổi link Web App Google Sheets của bạn vào đây (giữ nguyên dấu ngoặc kép)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZgDNYbtCkuYY1aIHcwCwmx83nDZsSj4miKMmReA7M8TTwOFL31qLkSELpEQfsiyR8/exec";

let allSnapshots = [];
let filteredSnapshots = [];

const tableBody = document.getElementById('snapshotTableBody');
const form = document.getElementById('snapshotForm');
const submitBtn = document.getElementById('submitBtn');

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

// 4. Xử lý gửi Form Đăng ký Snapshot mới
form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const inputClassVal = document.getElementById('inputClass').value;
    const inputBuildNameVal = document.getElementById('inputBuildName').value.trim();
    const inputSkillTypeVal = document.getElementById('inputSkillType').value;
    const inputLinkVal = document.getElementById('inputLink').value.trim();

    // Kiểm tra định dạng link Snapshot hợp lệ (từ tsw.vn.cz hoặc median-xl.com)
    if (!inputLinkVal.includes('tsw.vn.cz') && !inputLinkVal.includes('median-xl.com')) {
        alert("Lỗi: Đường dẫn Snapshot phải thuộc hệ thống tsw.vn.cz hoặc median-xl.com!");
        return;
    }

    // Kiểm tra xem Link này đã tồn tại trong danh sách chưa
    const isDuplicate = allSnapshots.some(item => item.link.toLowerCase() === inputLinkVal.toLowerCase());
    if (isDuplicate) {
        alert("Lỗi: Đường dẫn Snapshot này đã được đăng ký trước đó rồi!");
        return;
    }

    // Khóa nút gửi tránh người dùng bấm liên tục
    submitBtn.innerText = 'Đang đồng bộ dữ liệu...';
    submitBtn.disabled = true;

    const newSnapshot = {
        characterClass: inputClassVal,
        buildName: inputBuildNameVal,
        skillType: inputSkillTypeVal,
        link: inputLinkVal
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSnapshot)
    })
    .then(() => {
        alert('Đăng ký Snapshot thành công! Dữ liệu đang được đồng bộ lên kho lưu trữ.');
        form.reset();
        submitBtn.innerText = 'Gửi Đăng Ký Snapshot';
        submitBtn.disabled = false;
        // Tải lại bảng sau 2.5s để Sheets kịp cập nhật dữ liệu mới
        setTimeout(loadSnapshots, 2500);
    })
    .catch(error => {
        console.error('Lỗi gửi dữ liệu:', error);
        alert('Có lỗi hệ thống kết nối xảy ra!');
        submitBtn.innerText = 'Gửi Đăng Ký Snapshot';
        submitBtn.disabled = false;
    });
});

// Khởi chạy
loadSnapshots();
