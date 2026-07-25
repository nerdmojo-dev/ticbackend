const isLoggedin = sessionStorage.getItem("accessToken") && sessionStorage.getItem("refreshToken");
const today = new Date().toISOString().split("T")[0];




if (!isLoggedin) {
    window.location.href = "/admin/login";
}


const limit = 5;

let page = 1;


async function loadUsers() {


    const response = await apiFetch(`/api/v1/auth/getUserList?page=${page}&offset=${limit}`);

    const data = await response.json();
    console.log(data);

    renderTable(data.data?.userList);

    document.getElementById("pageNo").innerText = `Page ${page}`;

    document.getElementById("prevBtn").disabled = page === 1;

    document.getElementById("nextBtn").disabled = page === data.data?.totalPages;
}


function renderTable(userList) {


    const tbody = document.getElementById("tableBody");

    tbody.innerHTML = "";

    if (userList != null && userList.length > 0)

        userList.forEach((user, index) => {

            tbody.innerHTML += `
            <tr class="border-b border-white/10 hover:bg-white/5">
                <td class="px-6 py-4">${(index + 1) + (page - 1) * limit}</td>
                <td class="px-6 py-4">${user.employeeId}</td>
                <td class="px-6 py-4">${user.fullName}</td>
                <td class="px-6 py-4">${user.department}</td>
                <td class="px-6 py-4 text-center">${user.accountLocked ? "Yes" : "No"}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center justify-center gap-2">

                        <button
                            class="px-3 py-1 rounded-lg text-sm font-medium
                                ${user.accountLocked
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-yellow-600 hover:bg-yellow-500'}
                                transition"
                            onclick="${user.accountLocked
                    ? `unlockAccount('${user._id}')`
                    : `lockAccount('${user._id}')`}">
                            ${user.accountLocked ? "Unlock" : "Lock"}
                        </button>

                        <button
                            class="px-3 py-1 rounded-lg text-sm font-medium
                                   bg-red-600 hover:bg-red-500
                                   transition"
                            onclick="resetPassword('${user._id}')">
                            Reset Password
                        </button>

                    </div>
                </td>
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
    loadUsers();
};

document.getElementById("prevBtn").onclick = () => {

    if (page > 1) {
        page--;
        loadUsers();
    }

};

loadUsers();


async function unlockAccount(userId) {
    if (!confirm("Unlock this account?")) return;

    console.log("Unlock:", userId);

    // Example:
    const response = await fetch(`/api/v1/auth/users/${userId}/unlock`);

    const data = await response.json();

    if (!data.hasError && response.status == 200) loadUsers();
}


async function lockAccount(userId) {
    if (!confirm("Lock this account?")) return;

    console.log("Lock:", userId);

    // Example:
    const response = await apiFetch(`/api/v1/auth/users/${userId}/lock`);

    const data = await response.json();

    if (!data.hasError && response.status == 200) loadUsers();
}

async function resetPassword(userId) {
    if (!confirm("Reset this user's password?")) return;

    console.log("Reset password:", userId);

    // Example:
    const response = await apiFetch(`/api/v1/auth/users/${userId}/reset-password`);

    const data = await response.json();
    console.log(data);
    if (!data.hasError && response.status == 200) { alert(`Temporary Password : ${data.data}`); loadUsers(); }
}