let loggedIn = false;
let uploadOnGoing = false;
let currentUser = "Public";
const socket = io();
window.addEventListener("DOMContentLoaded", (event) => {

    setupIOSocket();

    //public upload eventlisteners
    $("#publicUploadButton").on("click", _ => {
        $("#publicUploadInput").click();
    });
    $('#publicUploadInput').on('change', {
        table: "public"
    }, uploadFile);
    //private upload eventlisteners
    $("#privateUploadButton").on("click", _ => {
        $("#privateUploadInput").click();
    });
    $('#privateUploadInput').on('change', {
        table: "private"
    }, uploadFile);
    //delete all buttons
    $('#publicDeleteAll').on('click', {
        table: "public"
    }, deleteAllFiles);
    $('#privateDeleteAll').on('click', {
        table: "private"
    }, deleteAllFiles);


    //register button within modal
    $('#registerFormButton').on('click', registerUser);
    //login button within modal
    $('#loginFormButton').on('click', loginUser);

    //handle focusing input elements on modal opening
    $('#registerModal').on('shown.bs.modal', function () {
        $('#focusElementRegister').focus();
    });
    $('#loginModal').on('shown.bs.modal', function () {
        $('#focusElementLogin').focus();
    });

    //beforeunload event, notify user if upload still in progress
    $(window).on('beforeunload', function () {
        if (uploadOnGoing)
            return confirm();
        return undefined;
    });
    //get public files
    getTableFiles("public");

    //try logging in (if session is still available)
    $.get(
        `/users/loginSuccess`, (data) => {
            if (data) {
                loginSuccess(data);
            }
        }
    );
});


/* 
    File handling
*/
// get all files from the backend, which the current user has access to
function getTableFiles(user) {
    if (!user) {
        getTableFiles("public");
        if (loggedIn)
            getTableFiles("private");
        return;
    }
    if (user !== "public" && user !== "private") {
        console.error("wrong user!");
        return;
    }
    let filesOfUser = user === "public" ? "Public" : currentUser;
    $.get(
        `/files`, { username: filesOfUser },
        (files) => {
            loadTableFiles(files, user === "public" ? "public" : "private");
        }
    );
}

//display the given files in the given table
function loadTableFiles(files, table) {
    let tbody = $(`#${table}FileTable > tbody`);
    [...files].forEach((file) => {
        tbody.append(`
            <tr fileid=${file._id}>
                <td>${file.name}</td>
                <td>${convertFileSize(file.size)}</td>
                <td>
                    <div class="btn-group-lg">
                        <button type="button" class="btn btn-default text-success" onclick="downloadFile('${file._id}')">
                            <span class="iconify icon-large" data-icon="mdi:download" data-inline="false"></span>
                        </button>
                        <button type="button" class="btn btn-default text-danger" onclick="deleteFile(event, '${file._id}')">
                            <span class="iconify icon-large" data-icon="mdi:delete" data-inline="false"></span>
                        </button>
                    </div>
                </td>
            </tr>
        `);
    });
}


//try to download the given file
function downloadFile(id) {
    window.location.href = "/files/download?id=" + id;
}


//try to delete the given file
function deleteFile(_, id) {
    const tableRow = $(`[fileid='${id}']`);
    let filename = tableRow.find(`td:eq(0)`).text();
    let answer = window.confirm(`Are you sure you want to delete the file ${filename}?`);
    if (answer) {
        $.ajax({
            url: `/files/delete?fileId=${id}`,
            type: 'DELETE',
        });

    }
}

function deleteAllFiles(event) {
    const table = event.data.table;
    const user = table === "public" ? "Public" : currentUser;
    let answer = window.confirm(`Are you sure you want to delete all files?`);
    if (answer) {
        $.ajax({
            url: `/files/deleteAll?username=${user}`,
            type: 'DELETE'
        });
    }
}

//upload a file to either the public or your private directory
function uploadFile(event) {
    const user = event.data.table;
    const targetUser = user === "private" ? currentUser : "Public";
    const files = $(this).get(0).files;
    const formData = new FormData();
    if (files.length > 0) {
        for (let file of files) {
            formData.append("username", targetUser);
            formData.append("file", file, file.name);
        }
        // upload file
        $.ajax({
            url: `/files/upload`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                uploadCompleted();
            },
            //get progress on the current upload
            xhr: function () {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();
                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function (evt) {
                    if (!uploadOnGoing) {
                        uploadStarted();
                    }
                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        // update the Bootstrap progress bar with the new percentage
                        $(`#uploadContainer .progress-bar span`).text(`${convertFileSize(evt.loaded)} / ${convertFileSize(evt.total)}`);
                        $(`#uploadContainer .progress-bar`).width(percentComplete + '%');
                        $(`.front`).css("clip-path", `inset(0 0 0 ${percentComplete}%)`);
                        $(`.front`).css("-webkit-clip-path", `inset(0 0 0 ${percentComplete}%)`);
                        $("#uploadCurrentFileName").text(calculateCurrentFile(files, evt.loaded));
                    }
                }, false);
                return xhr;
            },
            //upload error
            error: function (error) {
                $(`#uploadContainer .progress-bar`).removeClass("bg-success").addClass("bg-danger");
                $(`#uploadContainer .progress-bar`).text("Error");
                $(`#uploadContainer .progress-bar`).width('100%');
                throw error;
            }
        });

    }
}

function uploadStarted() {
    uploadOnGoing = true;
    $(`#uploadContainer .progress-bar`).removeClass("bg-success");
    $("#uploadButton").fadeToggle();
    $(`#uploadContainer`).fadeToggle(500);
}

function uploadCompleted() {
    uploadOnGoing = false;
    $(`#uploadContainer .progress-bar`).addClass("bg-success");
    $("#uploadButton").fadeToggle();
    setTimeout(() => $(`#uploadContainer`).fadeToggle(1000), 4000);
}


/*
    Handling Authentication
*/

//try to register a new user
function registerUser(e) {
    e.preventDefault();
    $("#registerForm").find("small").text("");
    const registerFormData = $("#registerForm").serialize();
    $.post(
        `/users/register`, registerFormData,
        function (data) {
            if (data) {
                $('#registerModal').modal('hide');
                $("#registerSuccessful").css("display", "block");
                $('#loginModal').modal('show');
                $("#registerForm")[0].reset();

            } else {
                data.forEach(error => {
                    if (error === "The passwords do not match!") {
                        $("#registerPasswordError").append(error);
                    } else {
                        $("#registerNameError").append(error);
                    }
                });
            }
        }
    );
}

//try to login
function loginUser(e) {
    e.preventDefault();
    const loginFormData = $("#loginForm").serialize();
    $("#loginForm").find("small").text("");
    $.post(
        `/users/login`, loginFormData,
        function (data) {
            loginSuccess(data);
            $("#loginForm")[0].reset();

        }
    );
}

//login was successfull -> prepare for user usage
function loginSuccess(data) {
    if (data) {
        currentUser = data.name;
        loggedIn = true;
        $("#username").text(`Welcome ${data.name}`);
        $("#privateFiles").css("display", "block");
        if (data.role === "Admin")
            $('#adminRedirectLink').css("display", "inline-block");

        $("#loginButton").html('Logout<span class="iconify icon-small" data-icon="mdi:logout" data-inline="false"></span>');
        $('#loginButton').on('click', logoutUser);
        $("#loginButton").removeAttr("data-toggle");
        $('#loginModal').modal('hide');
        $('#registerButton').css('display', "none");
        getTableFiles("private");

    } else {
        $("#loginError").append("The name or password is incorrect");
    }
}

//logout the user
function logoutUser(e) {
    $.get(
        `/users/logout`,
        function (data) {
            location.reload();
        }
    );
}

/*
    Help functions
*/

//change the size display to make it more readable
function convertFileSize(size) {
    let units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let convertedSize = 0.0 + size;
    while (convertedSize / 1000 >= 1 && unitIndex < 4) {
        convertedSize /= 1000;
        unitIndex++;
    }
    return `${convertedSize.toFixed(1)} ${units[unitIndex]}`;
}

function calculateCurrentFile(files, loaded) {
    let totalBytes = 0;
    for (let file of files) {
        totalBytes += file.size;
        if (loaded < totalBytes)
            return file.name;
    }
    return "--";
}

function setupIOSocket() {
    socket.on("newFile", file => {
        loadTableFiles([file], file.table);
    });
    socket.on("deleteFile", fileId => {
        const tableRow = $(`[fileid='${fileId}']`).fadeOut(700, () => {
            tableRow.remove();
        });
    });
    socket.on("deleteAll", table => {
        $(`#${table}FileTable > tbody`).fadeOut(700, () => {
            $(`#${table}FileTable > tbody > tr`).remove();
        });
    });

}