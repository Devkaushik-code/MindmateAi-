/* =========================================
   MINDMATE AI — APP PART 2
   Firebase Dashboard, Streak, AI Chat & App Setup
========================================= */


/* =========================================
   STREAK CALCULATION
========================================= */

function calculateStreak(entries) {

    if (!entries || !entries.length) {
        return 0;
    }

    const dates = [
        ...new Set(
            entries
                .filter(entry => entry.createdAt)
                .map(entry => {

                    const dateValue =
                        getDateValue(entry.createdAt);

                    if (!dateValue) return null;

                    return new Date(dateValue)
                        .toISOString()
                        .split("T")[0];
                })
                .filter(Boolean)
        )
    ];


    dates.sort(
        (a, b) =>
            new Date(b) -
            new Date(a)
    );


    if (!dates.length) {
        return 0;
    }


    let streak = 0;


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let expectedDate =
        new Date(today);


    /*
       If the latest journal was yesterday,
       start the streak from yesterday.
    */

    const latestDate =
        new Date(
            `${dates[0]}T00:00:00`
        );


    const daysSinceLatest =
        Math.floor(
            (
                today.getTime() -
                latestDate.getTime()
            ) /
            (1000 * 60 * 60 * 24)
        );


    if (daysSinceLatest === 1) {

        expectedDate.setDate(
            expectedDate.getDate() - 1
        );
    }


    for (const date of dates) {

        const journalDate =
            new Date(
                `${date}T00:00:00`
            );


        if (
            journalDate.getTime() ===
            expectedDate.getTime()
        ) {

            streak++;


            expectedDate.setDate(
                expectedDate.getDate() - 1
            );

        } else if (
            journalDate < expectedDate
        ) {

            break;
        }
    }


    return streak;
}


/* =========================================
   DATE VALUE
========================================= */

function getDateValue(date) {

    if (!date) {
        return 0;
    }


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


        const parsed =
            new Date(date)
                .getTime();


        return Number.isNaN(parsed)
            ? 0
            : parsed;

    } catch {

        return 0;
    }
}


/* =========================================
   DASHBOARD
========================================= */

function renderDashboard() {

    const user =
        currentUser();


    if (!user) {
        return;
    }


    const journals =
        user.entries || [];


    /* =====================================
       USER NAME
    ===================================== */

    if ($("userName")) {

        $("userName").textContent =
            user.name;
    }


    /* =====================================
       AVATARS
    ===================================== */

    document
        .querySelectorAll(
            ".profile-avatar, .avatar, #profileAvatar, #homeAvatar"
        )
        .forEach(avatar => {

            avatar.textContent =
                getInitials(
                    user.name
                );
        });


    /* =====================================
       TOTAL JOURNALS
    ===================================== */

    if ($("totalJournals")) {

        $("totalJournals").textContent =
            journals.length;
    }


    /* =====================================
       STREAK
    ===================================== */

    const streak =
        calculateStreak(
            journals
        );


    if ($("streakNumber")) {

        $("streakNumber").textContent =
            streak;
    }


    /* =====================================
       STREAK CARD
    ===================================== */

    const streakStrong =
        document.querySelector(
            ".streak-card strong"
        );


    if (streakStrong) {

        streakStrong.textContent =
            `${streak} day${streak === 1 ? "" : "s"} streak`;
    }


    /* =====================================
       RECENT JOURNAL
    ===================================== */

    const recentJournal =
        [...journals]
            .sort(
                (a, b) =>
                    getDateValue(
                        b.updatedAt
                    ) -
                    getDateValue(
                        a.updatedAt
                    )
            )[0];


    const preview =
        document.querySelector(
            ".journal-preview"
        );


    if (recentJournal) {

        if ($("recentJournalTitle")) {

            $("recentJournalTitle")
                .textContent =
                recentJournal.title ||
                "Untitled reflection";
        }


        if ($("recentJournalText")) {

            $("recentJournalText")
                .textContent =
                (
                    recentJournal.content ||
                    ""
                ).substring(
                    0,
                    130
                );
        }


        /* CURRENT HTML SUPPORT */

        if (preview) {

            const title =
                preview.querySelector(
                    "h3"
                );


            const text =
                preview.querySelector(
                    "p"
                );


            const mood =
                preview.querySelector(
                    ".mood-dot"
                );


            if (title) {

                title.textContent =
                    recentJournal.title ||
                    "Untitled reflection";
            }


            if (text) {

                text.textContent =
                    (
                        recentJournal.content ||
                        ""
                    ).substring(
                        0,
                        130
                    );
            }


            if (mood) {

                mood.textContent =
                    recentJournal.mood ||
                    "🙂";
            }
        }


    } else {

        if (preview) {

            const title =
                preview.querySelector(
                    "h3"
                );


            const text =
                preview.querySelector(
                    "p"
                );


            const mood =
                preview.querySelector(
                    ".mood-dot"
                );


            if (title) {

                title.textContent =
                    "No journals yet";
            }


            if (text) {

                text.textContent =
                    "Write your first reflection to see it here.";
            }


            if (mood) {

                mood.textContent =
                    "📝";
            }
        }
    }
}


/* =========================================
   FIRESTORE CHAT REFERENCE
========================================= */

function getChatCollection() {

    const user =
        currentUser();


    if (!user) {
        return null;
    }


    if (
        !window.firebaseDB ||
        !window.firestoreCollection
    ) {

        console.error(
            "Firestore is not available."
        );

        return null;
    }


    return window.firestoreCollection(
        window.firebaseDB,
        "users",
        user.id,
        "chats"
    );
}


/* =========================================
   SAVE CHAT MESSAGE
========================================= */

async function saveChatMessage(
    role,
    text
) {

    const user =
        currentUser();


    if (!user) {
        return;
    }


    try {

        const chatRef =
            getChatCollection();


        if (!chatRef) {
            return;
        }


        await window.firestoreAddDoc(
            chatRef,
            {

                role:
                    role,

                text:
                    text,

                createdAt:
                    window.firestoreServerTimestamp()
            }
        );


        console.log(
            "Chat message saved to Firestore ✅"
        );


    } catch (error) {

        console.error(
            "Chat save error:",
            error
        );


        showToast(
            "Unable to save chat message."
        );
    }
}


/* =========================================
   ADD CHAT MESSAGE
========================================= */

function addChatMessage(
    role,
    text,
    save = true
) {

    const container =
        $("chatMessages");


    if (!container) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        role === "user"
            ? "chat-message user-message user"
            : "chat-message ai-message ai";


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        "message-bubble";


    bubble.textContent =
        text;


    message.appendChild(
        bubble
    );


    container.appendChild(
        message
    );


    container.scrollTop =
        container.scrollHeight;


    /*
       Save message to Firestore.
    */

    if (save) {

        saveChatMessage(
            role,
            text
        );
    }
}


/* =========================================
   DEMO AI — SMART RESPONSE ENGINE
========================================= */

function getDemoAIResponse(message) {

    const text =
        message
            .toLowerCase()
            .trim();


    /* =====================================
       GREETING
    ===================================== */

    if (
        /^(hi|hello|hey|hii|helo|good morning|good evening|good night)\b/
            .test(text)
    ) {

        return `Hey! 👋 I'm glad you're here.

How are you feeling today? You can tell me anything that's on your mind. 💜`;
    }


    /* =====================================
       JOKES
    ===================================== */

    if (
        text.includes("joke") ||
        text.includes("make me laugh") ||
        text.includes("something funny") ||
        text.includes("funny")
    ) {

        return `Of course! 😄

Why did the computer go to the doctor?

Because it had a virus! 💻😂

Want another one?`;
    }


    /* =====================================
       STRESS / ANXIETY
    ===================================== */

    if (
        text.includes("stress") ||
        text.includes("stressed") ||
        text.includes("anxious") ||
        text.includes("anxiety") ||
        text.includes("worried") ||
        text.includes("pressure") ||
        text.includes("overwhelmed")
    ) {

        if (
            text.includes("future") ||
            text.includes("career") ||
            text.includes("job") ||
            text.includes("study") ||
            text.includes("studies") ||
            text.includes("money")
        ) {

            return `It sounds like you're carrying a lot of uncertainty about the future. 💜

You don't need to solve your whole future today. Try focusing on one thing you can control right now.

Which part feels heaviest — studies, career, money, or simply not knowing what comes next?`;
        }


        return `That sounds stressful. 💜

Try taking one small step at a time. Take a slow breath, choose one task, and focus only on that task for a few minutes.

What's causing the most stress right now?`;
    }


    /* =====================================
       SAD / LONELY
    ===================================== */

    if (
        text.includes("sad") ||
        text.includes("lonely") ||
        text.includes("upset") ||
        text.includes("crying") ||
        text.includes("depressed")
    ) {

        return `I'm sorry you're having a difficult moment. 💜

You don't have to solve everything right now. Give yourself a little space to breathe and be kind to yourself.

Would you like to tell me what happened?`;
    }


    /* =====================================
       ANGRY / FRUSTRATED
    ===================================== */

    if (
        text.includes("angry") ||
        text.includes("mad") ||
        text.includes("frustrated") ||
        text.includes("annoyed")
    ) {

        return `It sounds like something really frustrated you. 💜

Before reacting, give yourself a moment to breathe and step back from the situation.

What happened that made you feel this way?`;
    }


    /* =====================================
       FUTURE / CAREER
    ===================================== */

    if (
        text.includes("future") ||
        text.includes("career") ||
        text.includes("job") ||
        text.includes("what will happen")
    ) {

        return `It's completely understandable to feel uncertain about the future. 💜

You don't have to figure out your entire life today. Focus on the next small step instead of everything at once.

What part of your future are you thinking about the most?`;
    }


    /* =====================================
       HAPPY / EXCITED
    ===================================== */

    if (
        text.includes("happy") ||
        text.includes("good") ||
        text.includes("great") ||
        text.includes("excited") ||
        text.includes("amazing") ||
        text.includes("wonderful")
    ) {

        return `I'm glad to hear that! 💜✨

Take a moment to appreciate this feeling.

What was the best part of your day?`;
    }


    /* =====================================
       THANK YOU
    ===================================== */

    if (
        text.includes("thank you") ||
        text.includes("thanks")
    ) {

        return `You're very welcome! 💜

I'm always happy to give you a space to think, reflect, or simply talk.

What's on your mind right now?`;
    }


    /* =====================================
       HELP
    ===================================== */

    if (
        text.includes("help me") ||
        text.includes("i need help") ||
        text.includes("what should i do")
    ) {

        return `I'm here with you. 💜

Let's take it one step at a time.

Tell me what's happening, and we'll try to break it down together.`;
    }


    /* =====================================
       DEFAULT
    ===================================== */

    return `Thanks for sharing that with me. 💜

I'm here to listen without judgment.

Tell me a little more — what part of this feels most important to you right now?`;
}


/* =========================================
   GEMINI AI
========================================= */

async function getAIResponse(message) {

    const config =
        window.MINDMATE_CONFIG || {};


    /*
       Do NOT read Gemini keys from
       localStorage.

       Public frontend should remain
       without a secret Gemini key.
    */

    const apiKey =
        config.GEMINI_API_KEY;


    /* =====================================
       DEMO MODE
    ===================================== */

    if (
        !apiKey ||
        apiKey ===
        "PASTE_YOUR_GEMINI_API_KEY_HERE"
    ) {

        return getDemoAIResponse(
            message
        );
    }


    try {

        const model =
            config.GEMINI_MODEL ||
            "gemini-2.0-flash";


        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;


        const response =
            await fetch(
                url,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            contents: [

                                {

                                    parts: [

                                        {

                                            text:
`You are Mindmate, a supportive AI journaling companion.

Be warm, concise and non-judgmental.

Do not claim to be a therapist or doctor.

Encourage reflection and healthy coping.

User message:

${message}`
                                        }
                                    ]
                                }
                            ]
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                `AI request failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        const responseText =
            data
                ?.candidates?.[0]
                ?.content
                ?.parts?.[0]
                ?.text;


        return (
            responseText ||
            getDemoAIResponse(
                message
            )
        );


    } catch (error) {

        console.error(
            "Gemini Error:",
            error
        );


        return getDemoAIResponse(
            message
        );
    }
}


/* =========================================
   RENDER CHAT
========================================= */

function renderChat() {

    const container =
        $("chatMessages");


    const user =
        currentUser();


    if (
        !container ||
        !user
    ) {

        return;
    }


    container.innerHTML =
        "";


    const chat =
        user.chat || [];


    if (!chat.length) {

        addChatMessage(
            "ai",
            "Hi! I'm Mindmate 💜 How are you feeling today?",
            false
        );

        return;
    }


    chat.forEach(
        message => {

            addChatMessage(
                message.role,
                message.text,
                false
            );
        }
    );
}


/* =========================================
   SEND CHAT MESSAGE
========================================= */

async function sendChatMessage() {

    const input =
        $("chatInput");


    const button =
        $("sendMessage");


    if (!input) {
        return;
    }


    const text =
        input.value
            .trim();


    if (!text) {
        return;
    }


    input.value =
        "";


    /* =====================================
       SHOW USER MESSAGE
    ===================================== */

    addChatMessage(
        "user",
        text,
        true
    );


    if (button) {

        button.disabled =
            true;
    }


    const container =
        $("chatMessages");


    if (!container) {

        if (button) {

            button.disabled =
                false;
        }

        return;
    }


    /* =====================================
       THINKING MESSAGE
    ===================================== */

    const thinking =
        document.createElement(
            "div"
        );


    thinking.className =
        "chat-message ai-message ai";


    thinking.innerHTML = `
        <div class="message-bubble">
            Thinking...
        </div>
    `;


    container.appendChild(
        thinking
    );


    container.scrollTop =
        container.scrollHeight;


    try {

        const response =
            await getAIResponse(
                text
            );


        thinking.remove();


        addChatMessage(
            "ai",
            response,
            true
        );


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        thinking.remove();


        addChatMessage(
            "a
