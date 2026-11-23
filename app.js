
const KEY = "aquawise_entries_v1";
const PROFILE = "aquawise_profile_v1";

// GET SAVED ENTRIES
function readEntries() {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
}

// SAVE ENTRIES
function saveEntries(entries) {
    localStorage.setItem(KEY, JSON.stringify(entries));
}

// CALCULATE TOTAL WATER USAGE
function total(entry) {
    return (
        Number(entry.bathing || 0) +
        Number(entry.cooking || 0) +
        Number(entry.washing || 0) +
        Number(entry.cleaning || 0) +
        Number(entry.gardening || 0) +
        Number(entry.other || 0)
    );
}

// GET INPUT NUMBER
function getNumber(id) {
    return Number(document.getElementById(id)?.value || 0);
}

// UPDATE DASHBOARD AND HISTORY
function refresh() {

    let entries = readEntries().sort(
        (a, b) => a.date.localeCompare(b.date)
    );

    let latest = entries[entries.length - 1];

    const today = document.getElementById("todayTotal");
    const per = document.getElementById("perPerson");
    const count = document.getElementById("entryCount");

    if (today) {
        today.textContent = (latest ? total(latest) : 0) + " L";
    }

    if (per) {
        per.textContent = (
            latest
                ? Math.round(total(latest) / Math.max(1, latest.members))
                : 0
        ) + " L";
    }

    if (count) {
        count.textContent = entries.length;
    }

    // DASHBOARD CHART

    const chart = document.getElementById("chart");

    if (chart) {

        if (entries.length === 0) {

            chart.innerHTML =
                '<p class="muted">Add usage entries to see your chart.</p>';

        } else {

            const last = entries.slice(-7);

            const max = Math.max(
                ...last.map(total),
                1
            );

            chart.innerHTML = last.map(entry => {

                const height = Math.max(
                    4,
                    total(entry) / max * 135
                );

                return `
                    <div class="bar-wrap">
                        <div class="bar"
                             style="height:${height}px"
                             title="${total(entry)} L">
                        </div>
                        <small>${entry.date.slice(5)}</small>
                    </div>
                `;

            }).join("");
        }
    }

    // USAGE HISTORY TABLE

    const body = document.getElementById("historyBody");

    if (body) {

        if (entries.length === 0) {

            body.innerHTML =
                '<tr><td colspan="5">No entries yet.</td></tr>';

        } else {

            body.innerHTML = entries.slice().reverse().map(entry => {

                return `
                    <tr>
                        <td>${entry.date}</td>
                        <td>${total(entry)} L</td>
                        <td>${entry.members}</td>
                        <td>
                            ${Math.round(
                                total(entry) / Math.max(1, entry.members)
                            )} L
                        </td>
                        <td>
                            <button class="delete-row"
                                    data-date="${entry.date}">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;

            }).join("");
        }
    }
}


// RUN AFTER PAGE LOADS

document.addEventListener("DOMContentLoaded", function () {

    refresh();

    // DEFAULT DATE

    const date = document.getElementById("date");

    if (date) {
        date.value = new Date().toLocaleDateString("en-CA");
    }


    // SAVE WATER USAGE

    const usageForm = document.getElementById("usageForm");

    if (usageForm) {

        usageForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const entry = {

                date: date.value,

                members: getNumber("members"),

                bathing: getNumber("bathing"),

                cooking: getNumber("cooking"),

                washing: getNumber("washing"),

                cleaning: getNumber("cleaning"),

                gardening: getNumber("gardening"),

                other: getNumber("other")

            };

            let entries = readEntries();

            // REPLACE ENTRY IF DATE ALREADY EXISTS

            entries = entries.filter(
                item => item.date !== entry.date
            );

            entries.push(entry);

            saveEntries(entries);

            document.getElementById("formMessage").textContent =
                "Your usage entry has been saved successfully!";

            refresh();

        });
    }


    // DELETE INDIVIDUAL ENTRY

    const historyBody = document.getElementById("historyBody");

    if (historyBody) {

        historyBody.addEventListener("click", function (event) {

            if (event.target.matches(".delete-row")) {

                const selectedDate = event.target.dataset.date;

                const updated = readEntries().filter(
                    entry => entry.date !== selectedDate
                );

                saveEntries(updated);

                refresh();
            }
        });
    }


    // CLEAR ALL HISTORY

    const clearHistory = document.getElementById("clearHistory");

    if (clearHistory) {

        clearHistory.onclick = function () {

            if (confirm("Delete all usage entries?")) {

                saveEntries([]);

                refresh();
            }
        };
    }


    // RAINWATER CALCULATOR

    const roof = document.getElementById("roof");

    if (roof) {

        function calculateRainwater() {

            const area = getNumber("roof");

            const rainfall = getNumber("rainfall");

            const coefficient = getNumber("coefficient");

            const litres = area * rainfall * coefficient;

            document.getElementById("rainResult").textContent =
                Math.round(litres).toLocaleString() + " L";
        }

        ["roof", "rainfall", "coefficient"].forEach(id => {

            document.getElementById(id).addEventListener(
                "input",
                calculateRainwater
            );
        });

        calculateRainwater();
    }


    // PROFILE PAGE

    const profileForm = document.getElementById("profileForm");

    if (profileForm) {

        const profile = JSON.parse(
            localStorage.getItem(PROFILE) || "{}"
        );

        ["fullName", "email", "household", "city"].forEach(id => {

            if (profile[id] !== undefined) {

                document.getElementById(id).value = profile[id];
            }
        });

        const heading = document.getElementById("profileHeading");

        heading.textContent = profile.fullName
            ? "Hello, " + profile.fullName + "!"
            : "Hello, AquaWise User!";

        profileForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const data = {};

            ["fullName", "email", "household", "city"].forEach(id => {

                data[id] = document.getElementById(id).value;
            });

            localStorage.setItem(PROFILE, JSON.stringify(data));

            heading.textContent =
                "Hello, " + (data.fullName || "AquaWise User") + "!";

            document.getElementById("profileMessage").textContent =
                "Profile saved successfully!";
        });
    }


    // SETTINGS PAGE

    const deleteData = document.getElementById("deleteData");

    if (deleteData) {

        deleteData.onclick = function () {

            if (confirm("Clear all saved usage data?")) {

                saveEntries([]);

                document.getElementById("settingsMessage").textContent =
                    "Usage data has been cleared.";
            }
        };
    }


    // DEMO LOGIN

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            // DEMO ONLY - NOT REAL AUTHENTICATION

            window.location.href = "index.html";
        });
    }

});
