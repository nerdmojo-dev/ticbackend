const isLoggedin = sessionStorage.getItem("accessToken") && sessionStorage.getItem("refreshToken");
const today = new Date().toISOString().split("T")[0];




if (!isLoggedin) {
    window.location.href = "/admin/login";
}

document.getElementById("startDate").textContent = today;


const limit = 5;

let page = 1;

async function loadFiles() {

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const response = await apiFetch(`/api/v1/tasks/getAssignedTasks?page=${page}&offset=${limit}&startDate=${startDate}&endDate=${endDate}`);

    const data = await response.json();
    console.log(data);

    renderTable(data.data?.tasks);

    document.getElementById("pageNo").innerText = `Page ${page}`;

    document.getElementById("prevBtn").disabled = page === 1;

    document.getElementById("nextBtn").disabled = page === data.data?.totalPages;
}


document.getElementById("filterBtn").addEventListener("click", () => {
    window.location.href = "/admin/empUpload";
});


document.getElementById("exportBtn").addEventListener("click", exportExcel);


async function exportExcel() {

    try {

        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;

        const response = await apiFetch(`/api/v1/tasks/getAssignedTasks?page=${page}&offset=${10000}&startDate=${startDate}&endDate=${endDate}`);


        const data = await response.json();


        const excelData = data.data?.tasks?.map((task, index) => ({
            "S.No": index + 1,
            "User": task.createdBy?.fullName || task.createdBy?._id,
            "Task": task.title,
            "Description": task.description,
            "Status": task.status,
            "Priority": task.priority,
            "Due Date": task.dueDate.split("T")[0],
        }));


        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const columnWidths = Object.keys(excelData[0]).map((key) => {

            const maxLength = Math.max(
                key.length, // header length
                ...excelData.map(row => {
                    const value = row[key];
                    return value ? String(value).length : 0;
                })
            );

            return {
                wch: maxLength + 2 // padding
            };
        });

        worksheet["!cols"] = columnWidths;




        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Tasks"
        );


        XLSX.writeFile(
            workbook,
            `tasks_${Date.now()}.xlsx`
        );


    } catch (error) {

        console.error("Export failed:", error);

    }

}


function renderTable(tasks) {


    const tbody = document.getElementById("tableBody");

    tbody.innerHTML = "";

    if (tasks!=null&&tasks.length > 0)

        tasks.forEach((task, index) => {

            tbody.innerHTML += `
            <tr class="border-b border-white/10 hover:bg-white/5">
                <td class="px-6 py-4">${index + 1}</td>
                <td class="px-6 py-4">${task.createdBy.fullName}</td>
                <td class="px-6 py-4">${task.title}</td>
                <td class="px-6 py-4">${task.description}</td>
                <td class="px-6 py-4">${task.dueDate.toString().split("T")[0]}</td>
                <td class="px-6 py-4">${task.priority}</td>
            </tr>
        `;
        });
    else {
        tbody.innerHTML += `
        <td colspan="6" class="w-full py-3 col-span-full text-center text-gray-300 bg-white/5 rounded-lg">
            No tasks present in system
        </td>
        
        `;
    }

}

document.getElementById("nextBtn").onclick = () => {
    page++;
    loadFiles();
};

document.getElementById("prevBtn").onclick = () => {

    if (page > 1) {
        page--;
        loadFiles();
    }

};

loadFiles();
