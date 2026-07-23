async function apiFetch(url, options = {}) {

    let token = sessionStorage.getItem("accessToken");


    let response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });


    // Token expired
    if (response.status === 401) {

        const refreshed = await refreshToken();

        if (!refreshed) {
            logout();
            return;
        }


        // retry request with new token
        token = sessionStorage.getItem("accessToken");


        response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            }
        });
    }


    return response;
}



async function refreshToken() {

    const refreshToken =
        sessionStorage.getItem("refreshToken");


    if (!refreshToken)
        return false;


    const response = await fetch("/api/v1/auth/getAccessToken", {
        method: "GET",
        headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${refreshToken}`
        },
    });


    if (!response.ok)
        return false;


    const data = await response.json();


    sessionStorage.setItem(
        "accessToken",
        data.data.token
    );


    return true;
}


function logout(){

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    window.location.href="/admin/login";
}

