/* =========================================
   MINDMATE AI — MAIN APP LOADER
========================================= */

const scripts = [
    "app-part1.js",
    "app-part2.js"
];

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src = src;

        script.onload = () => {
            console.log(`${src} loaded successfully`);
            resolve();
        };

        script.onerror = () => {
            reject(new Error(`Failed to load ${src}`));
        };

        document.body.appendChild(script);
    });
}

(async function startMindMate() {
    try {

        // Load Part 1 first
        await loadScript(scripts[0]);

        // Then load Part 2
        await loadScript(scripts[1]);

        console.log("MindMate AI loaded successfully ✅");

        // Start Part 1
        if (typeof setupPart1 === "function") {
            setupPart1();
        }

        // Start Part 2
        if (typeof setupApp === "function") {
            setupApp();
        }

    } catch (error) {

        console.error("MindMate loading error:", error);

        alert(
            "MindMate AI load nahi ho pa raha. " +
            "Console mein error check karo."
        );
    }
})();