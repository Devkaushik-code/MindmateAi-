/* =========================================
   MINDMATE AI — APP PART 1
   Storage, Authentication, Journal & History
========================================= */

const STORAGE_USERS = "mindmate_users";
const STORAGE_SESSION = "mindmate_session";

const $ = (id) => document.getElementById(id);


/* =========================================
   STORAGE
========================================= */

function getUsers() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_USERS) || "[]"
        );
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        STORAGE_USERS,
        JSON.stringify(users)
    );
}

function getSession() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_SESSION) || "null"
        );
    } catch {
        return null;
    }
}

function saveSession(userId) {
    localStorage.setItem(
        STORAGE_SESSION,
        JSON.stringify({ userId })
    );
}

function generateId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );
}


/* =========================================
   USER
========================================= */

function currentUser() {
    const session = getSession();

    if (!session) return null;

    return getUsers().find(
        user => user.id === session.userId
    ) || null;
}

function updateUser(updatedUser) {
    const users = getUsers().map(
        user =>
            user.id === updatedUser.id
                ? updatedUser
                : user
    );

    saveUsers(users);
}

function logout() {
    localStorage.removeItem(STORAGE_SESSION);

    showToast("Logged out successfully.");

    setTimeout(() => {
        location.reload();
    }, 300);
}


/* =========================================
   HELPERS
========================================= */

function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = String(text || "");
    return div.innerHTML;
}

function getInitials(name) {
    return (name || "M")
        .split(" ")
        .map(word => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    let toast = $("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================
   AUTH SCREEN
========================================= */

let authMode = "login";


function showAuthMode(mode) {

    authMode = mode;

    const title = $("authTitle");
    const subtitle = $("authSubtitle");
    const button = $("authButton");
    const switchButton = $("authSwitch");

    if (mode === "signup") {

        if (title) {
            title.textContent = "Create your account ✨";
        }

        if (subtitle) {
            subtitle.textContent =
                "Create your private space for thoughts and reflection.";
        }

        if (button) {
            button.textContent = "Create Account";
        }

        if (switchButton) {
            switchButton.innerHTML =
                `Already have an account? <span>Sign in</span>`;
        }

        addSignupNameField();

    } else {

        if (title) {
            title.textContent = "Welcome back 👋";
        }

        if (subtitle) {
            subtitle.textContent =
                "Your private space for thoughts, feelings and reflection.";
        }

        if (button) {
            button.textContent = "Sign In";
        }

        if (switchButton) {
            switchButton.innerHTML =
                `Don't have an account? <span>Create one</span>`;
        }

        removeSignupNameField();
    }
}


/* =========================================
   DYNAMIC SIGNUP NAME FIELD
========================================= */

function addSignupNameField() {

    if ($("signupName")) return;

    const form = $("authForm");

    if (!form) return;

    const passwordGroup =
        $("password")?.closest(".input-group");

    if (!passwordGroup) return;

    const group = document.createElement("div");

    group.className = "input-group";

    group.id = "signupNameGroup";

    group.innerHTML = `
        <label for="signupName">
            Your name
        </label>

        <input
            type="text"
            id="signupName"
            placeholder="Enter your name"
            autocomplete="name"
            required
        >
    `;

    form.insertBefore(group, passwordGroup);
}


function removeSignupNameField() {

    const group = $("signupNameGroup");

    if (group) {
        group.remove();
    }
}


/* =========================================
   AUTH ERROR
========================================= */

function getAuthErrorElement() {

    let error = $("authError");

    if (!error) {

        error = document.createElement("p");

        error.id = "authError";

        error.style.marginTop = "10px";
        error.style.fontSize = "14px";
        error.style.textAlign = "center";

        const form = $("authForm");

        if (form) {
            form.appendChild(error);
        }
    }

    return error;
}


/* =========================================
   AUTHENTICATION
========================================= */

function setupAuthentication() {

    const authForm = $("authForm");
    const authSwitch = $("authSwitch");
    const togglePassword = $("togglePassword");

    if (!authForm) {
        console.error("Mindmate: authForm not found.");
        return;
    }


    /* PASSWORD TOGGLE */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                const password = $("password");

                if (!password) return;

                if (password.type === "password") {

                    password.type = "text";
                    togglePassword.textContent = "🙈";

                } else {

                    password.type = "password";
                    togglePassword.textContent = "👁️";
                }
            }
        );
    }


    /* LOGIN / SIGNUP SWITCH */

    if (authSwitch) {

        authSwitch.addEventListener(
            "click",
            () => {

                if (authMode === "login") {
                    showAuthMode("signup");
                } else {
                    showAuthMode("login");
                }

            }
        );
    }


    /* AUTH FORM */

    authForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const email =
                $("email")?.value
                    .trim()
                    .toLowerCase() || "";

            const password =
                $("password")?.value || "";

            const error =
                getAuthErrorElement();

            error.textContent = "";


            /* BASIC VALIDATION */

            if (!email || !password) {

                error.textContent =
                    "Please enter your email and password.";

                return;
            }


            /* ================= LOGIN ================= */

            if (authMode === "login") {

                const users = getUsers();

                const user = users.find(
                    account =>
                        account.email === email &&
                        account.password === password
                );


                if (!user) {

                    error.textContent =
                        "Invalid email or password.";

                    return;
                }


                saveSession(user.id);

                showToast(
                    `Welcome back, ${user.name}! 👋`
                );

                setTimeout(() => {
                    location.reload();
                }, 300);

                return;
            }


            /* ================= SIGNUP ================= */

            const name =
                $("signupName")?.value
                    .trim() || "";


            if (!name) {

                error.textContent =
                    "Please enter your name.";

                return;
            }


            if (password.length < 4) {

                error.textContent =
                    "Password must be at least 4 characters.";

                return;
            }


            const users = getUsers();

            const exists = users.some(
                user =>
                    user.email === email
            );


            if (exists) {

                error.textContent =
                    "An account already exists with this email.";

                return;
            }


            const newUser = {

                id: generateId(),

                name: name,

                email: email,

                password: password,

                entries: [],

                chat: []
            };


            users.push(newUser);

            saveUsers(users);

            saveSession(newUser.id);


            showToast(
                "Account created successfully! 🎉"
            );


            setTimeout(() => {
                location.reload();
            }, 300);
        }
    );
}


/* =========================================
   AUTH SCREEN / APP SCREEN
========================================= */

function setupAuthVisibility() {

    const authScreen = $("authScreen");
    const appScreen = $("appScreen");

    const user = currentUser();


    if (user) {

        if (authScreen) {
            authScreen.classList.add("hidden");
        }

        if (appScreen) {
            appScreen.classList.remove("hidden");
        }

    } else {

        if (authScreen) {
            authScreen.classList.remove("hidden");
        }

        if (appScreen) {
            appScreen.classList.add("hidden");
        }
    }
}


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });


    const selectedPage = $(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }


    document
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );
        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   JOURNAL
========================================= */

let editingJournalId = null;

let selectedMood = "Happy";


function updateMoodSelection() {

    document
        .querySelectorAll("[data-mood]")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.mood === selectedMood
            );
        });

    document
        .querySelectorAll("[data-editor-mood]")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.editorMood === selectedMood
            );
        });
}


/* =========================================
   JOURNAL COUNT
========================================= */

function updateWordCount() {

    const textarea = $("thoughts");
    const counter = $("characterCount");

    if (!textarea || !counter) return;

    const text = textarea.value;

    counter.textContent =
        `${text.length} characters`;
}


/* =========================================
   CLEAR JOURNAL
========================================= */

function clearJournal() {

    editingJournalId = null;

    selectedMood = "Happy";


    const title = $("journalTitle");
    const content = $("thoughts");


    if (title) {
        title.value = "";
    }

    if (content) {
        content.value = "";
    }


    updateMoodSelection();
    updateWordCount();
}


/* =========================================
   SAVE JOURNAL
========================================= */

function saveJournal() {

    const user = currentUser();

    if (!user) {
        showToast("Please log in first.");
        return;
    }


    const title =
        $("journalTitle")?.value
            .trim() || "";


    const content =
        $("thoughts")?.value
            .trim() || "";


    if (!content) {

        showToast(
            "Please write something before saving."
        );

        return;
    }


    user.entries = user.entries || [];


    const now =
        new Date().toISOString();


    if (editingJournalId) {

        const journal =
            user.entries.find(
                entry =>
                    entry.id === editingJournalId
            );


        if (journal) {

            journal.title =
                title || "Untitled reflection";

            journal.content =
                content;

            journal.mood =
                selectedMood;

            journal.updatedAt =
                now;
        }


        showToast(
            "Journal updated successfully."
        );

    } else {

        user.entries.push({

            id: generateId(),

            title:
                title || "Untitled reflection",

            content: content,

            mood: selectedMood,

            createdAt: now,

            updatedAt: now
        });


        showToast(
            "Journal saved successfully."
        );
    }


    updateUser(user);

    clearJournal();

    renderDashboard();

    renderHistory();
}


/* =========================================
   EDIT JOURNAL
========================================= */

function editJournal(id) {

    const user = currentUser();

    if (!user) return;


    const journal =
        (user.entries || []).find(
            entry => entry.id === id
        );


    if (!journal) return;


    editingJournalId = id;

    selectedMood =
        journal.mood || "Happy";


    if ($("journalTitle")) {
        $("journalTitle").value =
            journal.title || "";
    }


    if ($("thoughts")) {
        $("thoughts").value =
            journal.content || "";
    }


    updateMoodSelection();

    updateWordCount();

    showPage("journal");
}


/* =========================================
   DELETE JOURNAL
========================================= */

function deleteJournal(id) {

    if (
        !confirm(
            "Are you sure you want to delete this journal?"
        )
    ) {
        return;
    }


    const user = currentUser();

    if (!user) return;


    user.entries =
        (user.entries || []).filter(
            entry => entry.id !== id
        );


    updateUser(user);

    renderHistory();

    renderDashboard();

    showToast("Journal deleted.");
}


/* =========================================
   HISTORY
========================================= */

function renderHistory(query = "") {

    const historyList = $("historyList");

    if (!historyList) return;


    const user = currentUser();

    if (!user) return;


    const search =
        query.toLowerCase().trim();


    const journals =
        [...(user.entries || [])]
            .filter(journal => {

                const searchableText = `
                    ${journal.title || ""}
                    ${journal.content || ""}
                    ${journal.mood || ""}
                `.toLowerCase();

                return searchableText.includes(search);
            })
            .sort(
                (a, b) =>
                    new Date(b.updatedAt) -
                    new Date(a.updatedAt)
            );


    if (!journals.length) {

        historyList.innerHTML = `
            <div class="history-empty">
                <div style="font-size:40px">📖</div>

                <h3>No journals found</h3>

                <p>
                    Start writing your first reflection.
                </p>
            </div>
        `;

        return;
    }


    historyList.innerHTML =
        journals.map(journal => `

            <article class="history-card glass">

                <div class="history-date">

                    ${escapeHTML(
                        formatDate(journal.updatedAt)
                    )}

                    ·

                    ${escapeHTML(
                        journal.mood || "🙂"
                    )}

                </div>


                <h3>
                    ${escapeHTML(
                        journal.title ||
                        "Untitled reflection"
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        (journal.content || "").substring(
                            0,
                            180
                        )
                    )}

                    ${
                        (journal.content || "").length > 180
                            ? "..."
                            : ""
                    }
                </p>


                <div class="history-actions">

                    <button
                        class="history-edit"
                        data-edit="${journal.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="history-delete"
                        data-delete="${journal.id}"
                    >
                        Delete
                    </button>

                </div>

            </article>

        `).join("");


    historyList
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    editJournal(
                        button.dataset.edit
                    )
            );
        });


    historyList
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () =>
                    deleteJournal(
                        button.dataset.delete
                    )
            );
        });
}


/* =========================================
   PROFILE
========================================= */

function setupProfile() {

    const profileButton =
        $("profileButton");

    const profileOverlay =
        $("profileOverlay");

    const closeProfile =
        $("closeProfile");

    const logoutButton =
        $("logoutButton");


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                const user = currentUser();

                if (!user) return;


                if ($("profileEmail")) {
                    $("profileEmail").textContent =
                        user.email;
                }


                if ($("profileLargeAvatar")) {
                    $("profileLargeAvatar").textContent =
                        getInitials(user.name);
                }


                if (profileOverlay) {
                    profileOverlay.classList.remove("hidden");
                }
            }
        );
    }


    if (closeProfile) {

        closeProfile.addEventListener(
            "click",
            () => {

                profileOverlay?.classList.add(
                    "hidden"
                );
              }
    );
    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {
                logout();
            }
        );
    }


    if (profileOverlay) {

        profileOverlay.addEventListener(
            "click",
            (event) => {

                if (event.target === profileOverlay) {
                    profileOverlay.classList.add("hidden");
                }

            }
        );
    }
}


/* =========================================
   JOURNAL SETUP
========================================= */

function setupJournal() {

    const textarea = $("thoughts");
    const saveButton = $("saveJournal");

    if (textarea) {

        textarea.addEventListener(
            "input",
            updateWordCount
        );
    }

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveJournal
        );
    }


    document
        .querySelectorAll("[data-editor-mood]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedMood =
                        button.dataset.editorMood;

                    updateMoodSelection();
                }
            );
        });


    updateMoodSelection();
    updateWordCount();
}


/* =========================================
   HISTORY SETUP
========================================= */

function setupHistory() {

    const searchInput = $("historySearch");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {
                renderHistory(searchInput.value);
            }
        );
    }

    renderHistory();
}


/* =========================================
   PART 1 INITIALIZATION
========================================= */

function setupPart1() {

    console.log("MindMate Part 1 starting...");

    setupAuthVisibility();
    setupAuthentication();
    setupProfile();
    setupJournal();
    setupHistory();

    console.log("MindMate Part 1 ready ✅");
}