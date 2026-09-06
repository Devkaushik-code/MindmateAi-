/* =========================================
   MINDMATE AI — APP PART 1
   Firebase Authentication + Firestore
   Journal, History & Profile
========================================= */


/* =========================================
   DOM HELPER
========================================= */

const $ = (id) => document.getElementById(id);


/* =========================================
   FIREBASE USER
========================================= */

let mindmateUser = null;


/* =========================================
   APP STATE
========================================= */

let authMode = "login";

let editingJournalId = null;

let selectedMood = "Happy";


/* =========================================
   CURRENT USER
========================================= */

function currentUser() {
    return mindmateUser;
}


/* =========================================
   GENERATE LOCAL ID
========================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================
   HELPERS
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text || "");

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

    if (!date) return "";

    try {

        if (
            date &&
            typeof date.toDate === "function"
        ) {
            date = date.toDate();
        }

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

    } catch {

        return "";
    }
}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    let toast = $("toast");

    if (!toast) {

        toast =
            document.createElement("div");

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
   FIREBASE USER DOCUMENT
========================================= */

async function loadFirebaseUser(firebaseUser) {

    if (!firebaseUser) {

        mindmateUser = null;

        return;
    }


    try {

        const userRef =
            window.firestoreDoc(
                window.firebaseDB,
                "users",
                firebaseUser.uid
            );


        const userSnap =
            await window.firestoreGetDoc(
                userRef
            );


        let userData = {};


        if (userSnap.exists()) {

            userData =
                userSnap.data() || {};
        }


        mindmateUser = {

            id: firebaseUser.uid,

            name:
                userData.name ||
                firebaseUser.displayName ||
                "MindMate User",

            email:
                firebaseUser.email || "",

            entries: [],

            chat: []
        };


        await loadJournals();

        await loadChat();


        console.log(
            "Firebase user loaded ✅"
        );


    } catch (error) {

        console.error(
            "Failed to load Firebase user:",
            error
        );

        showToast(
            "Unable to load your account data."
        );
    }
}


/* =========================================
   LOAD JOURNALS
========================================= */

async function loadJournals() {

    if (!mindmateUser) return;


    try {

        const journalsRef =
            window.firestoreCollection(
                window.firebaseDB,
                "users",
                mindmateUser.id,
                "journals"
            );


        const snapshot =
            await window.firestoreGetDocs(
                journalsRef
            );


        mindmateUser.entries =
            snapshot.docs.map(docSnap => {

                return {

                    id: docSnap.id,

                    ...docSnap.data()
                };

            });


        console.log(
            `Loaded ${mindmateUser.entries.length} journals.`
        );


    } catch (error) {

        console.error(
            "Failed to load journals:",
            error
        );
    }
}


/* =========================================
   LOAD CHAT
========================================= */

async function loadChat() {

    if (!mindmateUser) return;


    try {

        const chatRef =
            window.firestoreCollection(
                window.firebaseDB,
                "users",
                mindmateUser.id,
                "chats"
            );


        const chatQuery =
            window.firestoreQuery(
                chatRef,
                window.firestoreOrderBy(
                    "createdAt",
                    "asc"
                )
            );


        const snapshot =
            await window.firestoreGetDocs(
                chatQuery
            );


        mindmateUser.chat =
            snapshot.docs.map(docSnap => {

                return {

                    id: docSnap.id,

                    ...docSnap.data()
                };

            });


        console.log(
            `Loaded ${mindmateUser.chat.length} chat messages.`
        );


    } catch (error) {

        console.error(
            "Failed to load chat:",
            error
        );

        /*
         If chat collection is empty or
         old documents don't have createdAt,
         don't break the whole application.
        */

        mindmateUser.chat = [];
    }
}


/* =========================================
   GET FIRESTORE TIMESTAMP
========================================= */

function getTimestamp() {

    if (
        window.firestoreServerTimestamp
    ) {

        return window.firestoreServerTimestamp();
    }

    return new Date().toISOString();
}


/* =========================================
   AUTH SCREEN
========================================= */

function showAuthMode(mode) {

    authMode = mode;

    const title =
        $("authTitle");

    const subtitle =
        $("authSubtitle");

    const button =
        $("authButton");

    const switchButton =
        $("authSwitch");


    if (mode === "signup") {

        if (title) {

            title.textContent =
                "Create your account ✨";
        }


        if (subtitle) {

            subtitle.textContent =
                "Create your private space for thoughts and reflection.";
        }


        if (button) {

            button.textContent =
                "Create Account";
        }


        if (switchButton) {

            switchButton.innerHTML =
                `Already have an account? <span>Sign in</span>`;
        }


        addSignupNameField();


    } else {

        if (title) {

            title.textContent =
                "Welcome back 👋";
        }


        if (subtitle) {

            subtitle.textContent =
                "Your private space for thoughts, feelings and reflection.";
        }


        if (button) {

            button.textContent =
                "Sign In";
        }


        if (switchButton) {

            switchButton.innerHTML =
                `Don't have an account? <span>Create one</span>`;
        }


        removeSignupNameField();
    }
}


/* =========================================
   SIGNUP NAME FIELD
========================================= */

function addSignupNameField() {

    if ($("signupName")) return;


    const form =
        $("authForm");

    if (!form) return;


    const passwordGroup =
        $("password")?.closest(
            ".input-group"
        );


    if (!passwordGroup) return;


    const group =
        document.createElement("div");


    group.className =
        "input-group";

    group.id =
        "signupNameGroup";


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


    form.insertBefore(
        group,
        passwordGroup
    );
}


function removeSignupNameField() {

    const group =
        $("signupNameGroup");

    if (group) {

        group.remove();
    }
}


/* =========================================
   AUTH ERROR
========================================= */

function getAuthErrorElement() {

    let error =
        $("authError");


    if (!error) {

        error =
            document.createElement("p");


        error.id =
            "authError";


        error.style.marginTop =
            "10px";


        error.style.fontSize =
            "14px";


        error.style.textAlign =
            "center";


        const form =
            $("authForm");


        if (form) {

            form.appendChild(error);
        }
    }


    return error;
}


/* =========================================
   FIREBASE ERROR MESSAGE
========================================= */

function getFirebaseAuthError(error) {

    if (!error) {

        return "Something went wrong.";
    }


    switch (error.code) {

        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/user-not-found":

            return "No account found with this email.";


        case "auth/wrong-password":

            return "Incorrect password.";


        case "auth/invalid-credential":

            return "Incorrect email or password.";


        case "auth/email-already-in-use":

            return "An account already exists with this email.";


        case "auth/weak-password":

            return "Password should be at least 6 characters.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        case "auth/too-many-requests":

            return "Too many attempts. Please try again later.";


        default:

            return (
                error.message ||
                "Authentication failed."
            );
    }
}


/* =========================================
   AUTHENTICATION
========================================= */

function setupAuthentication() {

    const authForm =
        $("authForm");

    const authSwitch =
        $("authSwitch");

    const togglePassword =
        $("togglePassword");


    if (!authForm) {

        console.error(
            "MindMate: authForm not found."
        );

        return;
    }


    /* =====================================
       PASSWORD TOGGLE
    ===================================== */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            () => {

                const password =
                    $("password");


                if (!password) return;


                if (
                    password.type ===
                    "password"
                ) {

                    password.type =
                        "text";

                    togglePassword.textContent =
                        "🙈";

                } else {

                    password.type =
                        "password";

                    togglePassword.textContent =
                        "👁️";
                }
            }
        );
    }


    /* =====================================
       LOGIN / SIGNUP SWITCH
    ===================================== */

    if (authSwitch) {

        authSwitch.addEventListener(
            "click",
            () => {

                if (
                    authMode === "login"
                ) {

                    showAuthMode(
                        "signup"
                    );

                } else {

                    showAuthMode(
                        "login"
                    );
                }
            }
        );
    }


    /* =====================================
       AUTH FORM
    ===================================== */

    authForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                $("email")?.value
                    .trim()
                    .toLowerCase() || "";


            const password =
                $("password")?.value || "";


            const error =
                getAuthErrorElement();


            error.textContent =
                "";


            /* BASIC VALIDATION */

            if (
                !email ||
                !password
            ) {

                error.textContent =
                    "Please enter your email and password.";

                return;
            }


            /* =================================
               CHECK FIREBASE
            ================================= */

            if (
                !window.firebaseAuth ||
                !window.firebaseSignIn ||
                !window.firebaseCreateUser
            ) {

                error.textContent =
                    "Firebase is not ready. Please refresh the page.";

                console.error(
                    "Firebase Authentication functions are missing."
                );

                return;
            }


            /* =================================
               LOGIN
            ================================= */

            if (
                authMode === "login"
            ) {

                try {

                    const result =
                        await window.firebaseSignIn(
                            window.firebaseAuth,
                            email,
                            password
                        );


                    await loadFirebaseUser(
                        result.user
                    );


                    showToast(
                        `Welcome back, ${mindmateUser.name}! 👋`
                    );


                    setupAuthVisibility();

                    renderDashboard();

                    renderHistory();


                } catch (firebaseError) {

                    console.error(
                        firebaseError
                    );


                    error.textContent =
                        getFirebaseAuthError(
                            firebaseError
                        );
                }


                return;
            }


            /* =================================
               SIGNUP
            ================================= */

            const name =
                $("signupName")?.value
                    .trim() || "";


            if (!name) {

                error.textContent =
                    "Please enter your name.";

                return;
            }


            if (
                password.length < 6
            ) {

                error.textContent =
                    "Password must be at least 6 characters.";

                return;
            }


            try {

                const result =
                    await window.firebaseCreateUser(
                        window.firebaseAuth,
                        email,
                        password
                    );


                /* =================================
                   SAVE DISPLAY NAME
                ================================= */

                if (
                    window.firebaseUpdateProfile
                ) {

                    await window.firebaseUpdateProfile(
                        result.user,
                        {
                            displayName: name
                        }
                    );
                }


                /* =================================
                   CREATE FIRESTORE USER DOCUMENT
                ================================= */

                const userRef =
                    window.firestoreDoc(
                        window.firebaseDB,
                        "users",
                        result.user.uid
                    );


                await window.firestoreSetDoc(
                    userRef,
                    {
                        name: name,

                        email: email,

                        createdAt:
                            getTimestamp()
                    },
                    {
                        merge: true
                    }
                );


                await loadFirebaseUser(
                    result.user
                );


                showToast(
                    "Account created successfully! 🎉"
                );


                setupAuthVisibility();

                renderDashboard();

                renderHistory();


            } catch (firebaseError) {

                console.error(
                    firebaseError
                );


                error.textContent =
                    getFirebaseAuthError(
                        firebaseError
                    );
            }

        }
    );
}


/* =========================================
   AUTH VISIBILITY
========================================= */

function setupAuthVisibility() {

    const authScreen =
        $("authScreen");

    const appScreen =
        $("appScreen");


    const user =
        currentUser();


    if (user) {

        if (authScreen) {

            authScreen.classList.add(
                "hidden"
            );
        }


        if (appScreen) {

            appScreen.classList.remove(
                "hidden"
            );
        }


    } else {

        if (authScreen) {

            authScreen.classList.remove(
                "hidden"
            );
        }


        if (appScreen) {

            appScreen.classList.add(
                "hidden"
            );
        }
    }
}


/* =========================================
   LOGOUT
========================================= */

async function logout() {

    try {

        if (
            window.firebaseSignOut &&
            window.firebaseAuth
        ) {

            await window.firebaseSignOut(
                window.firebaseAuth
            );
        }


        mindmateUser = null;

        showToast(
            "Logged out successfully."
        );


        setTimeout(() => {

            location.reload();

        }, 300);


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        showToast(
            "Unable to logout."
        );
    }
}


/* =========================================
   FIREBASE AUTH STATE
========================================= */

function setupFirebaseAuthState() {

    if (
        !window.firebaseAuth ||
        !window.firebaseAuthState
    ) {

        console.error(
            "Firebase Auth is not available."
        );

        setupAuthVisibility();

        return;
    }


    window.firebaseAuthState(
        window.firebaseAuth,
        async (firebaseUser) => {

            if (firebaseUser) {

                await loadFirebaseUser(
                    firebaseUser
                );


                setupAuthVisibility();


                if (
                    typeof renderDashboard ===
                    "function"
                ) {

                    renderDashboard();
                }


                if (
                    typeof renderHistory ===
                    "function"
                ) {

                    renderHistory();
                }


            } else {

                mindmateUser = null;

                setupAuthVisibility();
            }

        }
    );
}


/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );
        });


    const selectedPage =
        $(pageId);


    if (selectedPage) {

        selectedPage.classList.add(
            "active"
        );
    }


    document
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page ===
                pageId
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

function updateMoodSelection() {

    document
        .querySelectorAll("[data-mood]")
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.mood ===
                selectedMood
            );
        });


    document
        .querySelectorAll(
            "[data-editor-mood]"
        )
        .forEach(button => {

            button.classList.toggle(
                "selected",
                button.dataset.editorMood ===
                selectedMood
            );
        });
}


/* =========================================
   CHARACTER COUNT
========================================= */

function updateWordCount() {

    const textarea =
        $("thoughts");

    const counter =
        $("characterCount");


    if (
        !textarea ||
        !counter
    ) {

        return;
    }


    const text =
        textarea.value;


    counter.textContent =
        `${text.length} characters`;
}


/* =========================================
   CLEAR JOURNAL
========================================= */

function clearJournal() {

    editingJournalId =
        null;


    selectedMood =
        "Happy";


    const title =
        $("journalTitle");

    const content =
        $("thoughts");


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

async function saveJournal() {

    const user =
        currentUser();


    if (!user) {

        showToast(
            "Please log in first."
        );

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


    try {

        const journalsRef =
            window.firestoreCollection(
                window.firebaseDB,
                "users",
                user.id,
                "journals"
            );


        /* =================================
           UPDATE EXISTING JOURNAL
        ================================= */

        if (editingJournalId) {

            const journalRef =
                window.firestoreDoc(
                    window.firebaseDB,
                    "users",
                    user.id,
                    "journals",
                    editingJournalId
                );


            await window.firestoreUpdateDoc(
                journalRef,
                {

                    title:
                        title ||
                        "Untitled reflection",

                    content:
                        content,

                    mood:
                        selectedMood,

                    updatedAt:
                        getTimestamp()
                }
            );


            showToast(
                "Journal updated successfully."
            );


        } else {

            /* =============================
               CREATE NEW JOURNAL
            ============================= */

            await window.firestoreAddDoc(
                journalsRef,
                {

                    title:
                        title ||
                        "Untitled reflection",

                    content:
                        content,

                    mood:
                        selectedMood,

                    createdAt:
                        getTimestamp(),

                    updatedAt:
                        getTimestamp()
                }
            );


            showToast(
                "Journal saved successfully."
            );
        }


        await loadJournals();


        clearJournal();


        if (
            typeof renderDashboard ===
            "function"
        ) {

            renderDashboard();
        }


        renderHistory();


    } catch (error) {

        console.error(
            "Save journal error:",
            error
        );


        showToast(
            "Unable to save journal. Please try again."
        );
    }
}


/* =========================================
   EDIT JOURNAL
========================================= */

function editJournal(id) {

    const user =
        currentUser();


    if (!user) return;


    const journal =
        (user.entries || [])
            .find(
                entry =>
                    entry.id === id
            );


    if (!journal) return;


    editingJournalId =
        id;


    selectedMood =
        journal.mood ||
        "Happy";


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

async function deleteJournal(id) {

    if (
        !confirm(
            "Are you sure you want to delete this journal?"
        )
    ) {

        return;
    }


    const user =
        currentUser();


    if (!user) return;


    try {

        const journalRef =
            window.firestoreDoc(
                window.firebaseDB,
                "users",
                user.id,
                "journals",
                id
            );


        await window.firestoreDeleteDoc(
            journalRef
        );


        await loadJournals();


        renderHistory();


        if (
            typeof renderDashboard ===
            "function"
        ) {

            renderDashboard();
        }


        showToast(
            "Journal deleted."
        );


    } catch (error) {

        console.error(
            "Delete journal error:",
            error
        );


        showToast(
            "Unable to delete journal."
        );
    }
}


/* =========================================
   HISTORY
========================================= */

function renderHistory(query = "") {

    const historyList =
        $("historyList");


    if (!historyList) return;


    const user =
        currentUser();


    if (!user) return;


    const search =
        query
            .toLowerCase()
            .trim();


    const journals =
        [...(user.entries || [])]
            .filter(journal => {

                const searchableText = `
                    ${journal.title || ""}
                    ${journal.content || ""}
                    ${journal.mood || ""}
                `.toLowerCase();


                return searchableText
                    .includes(search);

            })
            .sort(
                (a, b) =>
                    getDateValue(
                        b.updatedAt
                    ) -
                    getDateValue(
                        a.updatedAt
                    )
            );


    if (!journals.length) {

        historyList.innerHTML = `

            <div class="history-empty">

                <div
                    style="font-size:40px"
                >
                    📖
                </div>

                <h3>
                    No journals found
                </h3>

                <p>
                    Start writing your first reflection.
                </p>

            </div>

        `;

        return;
    }


    historyList.innerHTML =
        journals
            .map(journal => `

                <article
                    class="history-card glass"
                >

                    <div
                        class="history-date"
                    >

                        ${escapeHTML(
                            formatDate(
                                journal.updatedAt
                            )
                        )}

                        ·

                        ${escapeHTML(
                            journal.mood ||
                            "🙂"
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
                            (
                                journal.content ||
                                ""
                            ).substring(
                                0,
                                180
                            )
                        )}

                        ${
                            (
                                journal.content ||
                                ""
                            ).length > 180
                                ? "..."
                                : ""
                        }

                    </p>


                    <div
                        class="history-actions"
                    >

                        <button
                            class="history-edit"
                            data-edit="${escapeHTML(journal.id)}"
                        >
                            Edit
                        </button>


                        <button
                            class="history-delete"
                            data-delete="${escapeHTML(journal.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>

            `)
            .join("");


    historyList
        .querySelectorAll(
            "[data-edit]"
        )
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
        .querySelectorAll(
            "[data-delete]"
        )
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
   DATE VALUE
========================================= */

function getDateValue(date) {

    if (!date) return 0;


    try {

        if (
            date &&
            typeof date.toDate ===
            "function"
        ) {

            return date
                .toDate()
                .getTime();
        }


        return new Date(date)
            .getTime();


    } catch {

        return 0;
    }
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

                const user =
                    currentUser();


                if (!user) return;


                if ($("profileEmail")) {

                    $("profileEmail")
                        .textContent =
                        user.email;
                }


                if (
                    $("profileLargeAvatar")
                ) {

                    $("profileLargeAvatar")
                        .textContent =
                        getInitials(
                            user.name
                        );
                }


                if (profileOverlay) {

                    profileOverlay
                        .classList
                        .remove("hidden");
                }

            }
        );
    }


    if (closeProfile) {

        closeProfile.addEventListener(
            "click",
            () => {

                profileOverlay?.classList
                    .add("hidden");

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

                if (
                    event.target ===
                    profileOverlay
                ) {

                    profileOverlay
                        .classList
                        .add("hidden");
                }

            }
        );
    }
}


/* =========================================
   JOURNAL SETUP
========================================= */

function setupJournal() {

    const textarea =
        $("thoughts");


    const saveButton =
        $("saveJournal");


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
        .querySelectorAll(
            "[data-editor-mood]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectedMood =
                        button.dataset
                            .editorMood;

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

    const searchInput =
        $("historySearch");


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                renderHistory(
                    searchInput.value
                );

            }
        );
    }


    renderHistory();
}


/* =========================================
   PART 1 INITIALIZATION
========================================= */

function setupPart1() {

    console.log(
        "MindMate Part 1 starting..."
    );


    setupAuthentication();

    setupProfile();

    setupJournal();

    setupHistory();


    /*
     Firebase Auth state listener
     must run after Firebase bridge
     has initialized.
    */

    setupFirebaseAuthState();


    console.log(
        "MindMate Part 1 ready ✅"
    );
      }
