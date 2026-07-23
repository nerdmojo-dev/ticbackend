const browseBtn = document.getElementById("browseBtn");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileName = document.getElementById("fileName");
const downloadSampleBtn = document.getElementById("downloadSampleBtn");

downloadSampleBtn.onclick = () => {
    window.location.href = "/sample.csv";
}

browseBtn.onclick = () => {
    fileInput.click();
}

fileInput.onchange = () => {

    if (fileInput.files.length > 0) {

        fileName.classList.remove("hidden");

        fileName.innerHTML =
            "✔ " + fileInput.files[0].name;
        importBtn.classList.remove("hidden");

    }

}
const importBtn = document.getElementById("importBtn");

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("dragover");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    fileInput.files = e.dataTransfer.files;

    if (fileInput.files.length > 0) {

        fileName.classList.remove("hidden");

        fileName.innerHTML =
            "✔ " + fileInput.files[0].name;

        importBtn.classList.remove("hidden");

    }

});



importBtn.onclick = async () => {

    const file = document.getElementById("fileInput").files[0];

    if (!file) {
        alert("Please select a CSV.");
        return;
    }



    const formData = new FormData();

    formData.append("csvFile", file);

    const uploadResponse = await apiFetch(
        "/api/v1/auth/registerUser",
        {
            method: "POST",
            body: formData
        }
    );

    const uploadResult = await uploadResponse.json();

    alert("Users imported successfully");

};