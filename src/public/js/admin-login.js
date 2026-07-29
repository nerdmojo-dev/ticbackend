const isLoggedin = sessionStorage.getItem("accessToken") && sessionStorage.getItem("refreshToken");

if (isLoggedin) {
    window.location.href = "/admin/home";
}

function hideError() {
    document.getElementById("errorBuider").classList.add("invisible");
}



async function performLogin(e) {
    console.log("hello");
    e.preventDefault();


    const userId = document.getElementById("userId").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/v1/auth/loginUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                employeeId: userId,
                password
            })
        });

        const data = await response.json();
        console.log(data);
        if (response.status != 200) {
            document.getElementById("errorText").innerText = data.message;
            document.getElementById("errorBuider").classList.remove("invisible");
            return;
        }



        if (data.data.user.role != "ADMIN") {
            document.getElementById("errorText").innerText = "Redirecting to app download page";
            document.getElementById("errorBuider").classList.remove("invisible");
            window.location.href = "/appDownload"; // Redirect after 3 seconds


            return;
        }

        console.log(data);

        // Save tokens
        sessionStorage.setItem("accessToken", data.data.token);
        sessionStorage.setItem("refreshToken", data.data.refreshToken);

        // Redirect
        window.location.href = "/admin/home";

    } catch (err) {
        alert(err.message);
        console.error(err);
    }
}