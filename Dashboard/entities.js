// ==========================================
// ENTITY ANALYSIS - FRAUDGUARD
// ==========================================

// Store all entities received from API
let allEntities = [];


// ==========================================
// API URL
// ==========================================

const ENTITY_API =
    "https://fraudguard-api-ch4d.onrender.com/entities";


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const entitySearch =
    document.getElementById("entitySearch");

const entityRiskFilter =
    document.getElementById("entityRiskFilter");

const clearEntityFilters =
    document.getElementById("clearEntityFilters");

const entityTableBody =
    document.getElementById("entityTableBody");


// ==========================================
// LOAD ENTITIES
// ==========================================

async function loadEntities() {

    try {

        console.log("Loading entity analysis...");

        const response =
            await fetch(ENTITY_API);

        if (!response.ok) {

            throw new Error(
                "Entity API returned status " +
                response.status
            );

        }

        const data =
            await response.json();

        console.log(
            "Entity API data:",
            data
        );


        // ======================================
        // STORE DATA
        // ======================================

        allEntities =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Total entities loaded:",
            allEntities.length
        );


        // ======================================
        // RESET FILTERS
        // ======================================

        if (entityRiskFilter) {

            entityRiskFilter.value = "ALL";

        }


        if (entitySearch) {

            entitySearch.value = "";

        }


        // ======================================
        // UPDATE SUMMARY
        // ======================================

        updateEntitySummary(
            allEntities
        );


        // ======================================
        // DISPLAY ENTITIES
        // ======================================

        renderEntities(
            allEntities
        );

    }

    catch (error) {

        console.error(
            "Unable to load entity analysis:",
            error
        );


        if (entityTableBody) {

            entityTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:30px;
                            color:#e4515a;
                        "
                    >

                        Unable to load entity analysis.

                    </td>

                </tr>

            `;

        }

    }

}


// ==========================================
// UPDATE ENTITY SUMMARY
// ==========================================

function updateEntitySummary(
    entities
) {

    const total =
        entities.length;


    // ======================================
    // COUNT HIGH
    // ======================================

    const high =
        entities.filter(
            entity =>
                String(
                    entity.risk_level || ""
                ).toUpperCase() === "HIGH"
        ).length;


    // ======================================
    // COUNT MEDIUM
    // ======================================

    const medium =
        entities.filter(
            entity =>
                String(
                    entity.risk_level || ""
                ).toUpperCase() === "MEDIUM"
        ).length;


    // ======================================
    // COUNT LOW
    // ======================================

    const low =
        entities.filter(
            entity =>
                String(
                    entity.risk_level || ""
                ).toUpperCase() === "LOW"
        ).length;


    // ======================================
    // IMPORTANT:
    // THESE IDs MATCH YOUR HTML
    // ======================================

    const totalElement =
        document.getElementById(
            "totalEntities"
        );


    const highElement =
        document.getElementById(
            "highEntities"
        );


    const mediumElement =
        document.getElementById(
            "mediumEntities"
        );


    const lowElement =
        document.getElementById(
            "lowEntities"
        );


    // ======================================
    // UPDATE HTML
    // ======================================

    if (totalElement) {

        totalElement.textContent =
            total.toLocaleString();

    }


    if (highElement) {

        highElement.textContent =
            high.toLocaleString();

    }


    if (mediumElement) {

        mediumElement.textContent =
            medium.toLocaleString();

    }


    if (lowElement) {

        lowElement.textContent =
            low.toLocaleString();

    }


    console.log(
        "Entity summary:",
        {
            total: total,
            high: high,
            medium: medium,
            low: low
        }
    );

}


// ==========================================
// RENDER ENTITIES
// ==========================================

function renderEntities(
    entities
) {

    if (!entityTableBody) {

        console.error(
            "entityTableBody not found."
        );

        return;

    }


    entityTableBody.innerHTML = "";


    // ======================================
    // NO RESULTS
    // ======================================

    if (
        !entities ||
        entities.length === 0
    ) {

        entityTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#6f7d95;
                    "
                >

                    No matching entities found.

                </td>

            </tr>

        `;

        return;

    }


    // ======================================
    // SHOW FIRST 20
    // ======================================

    entities
        .slice(0, 20)
        .forEach(
            entity => {


                // ==================================
                // CREATE ROW
                // ==================================

                const row =
                    document.createElement("tr");


                // ==================================
                // ENTITY ID
                // ==================================

                const entityId =
                    String(
                        entity.entity_id ||
                        "Unknown"
                    );


                // ==================================
                // CLUSTER
                // ==================================

                const cluster =
                    entity.entity_cluster !== undefined
                        ? entity.entity_cluster
                        : "-";


                // ==================================
                // TRANSACTION COUNT
                // ==================================

                const transactionCount =
                    Number(
                        entity.transaction_count || 0
                    );


                // ==================================
                // TOTAL BTC
                // ==================================

                const totalBTC =
                    Number(
                        entity.total_btc || 0
                    );


                // ==================================
                // AVERAGE RISK
                // ==================================

                const averageRisk =
                    Number(
                        entity.average_risk || 0
                    );


                // ==================================
                // HIGHEST RISK
                // ==================================

                const highestRisk =
                    Number(
                        entity.highest_risk || 0
                    );


                // ==================================
                // RISK LEVEL
                // ==================================

                const riskLevel =
                    String(
                        entity.risk_level || "LOW"
                    ).toUpperCase();


                // ==================================
                // RISK CSS CLASS
                // ==================================

                let riskClass =
                    "low-risk";


                if (
                    riskLevel === "HIGH"
                ) {

                    riskClass =
                        "high-risk";

                }

                else if (
                    riskLevel === "MEDIUM"
                ) {

                    riskClass =
                        "medium-risk";

                }


                // ==================================
                // CREATE TABLE ROW
                // ==================================

                row.innerHTML = `

                    <td>

                        <strong>

                            ${entityId.substring(
                                0,
                                16
                            )}...

                        </strong>

                    </td>


                    <td>
                        ${cluster}
                    </td>


                    <td>
                        ${transactionCount}
                    </td>


                    <td>

                        ${totalBTC.toFixed(4)}
                        BTC

                    </td>


                    <td>
                        ${averageRisk.toFixed(1)}
                    </td>


                    <td>
                        ${highestRisk.toFixed(1)}
                    </td>


                    <td>

                        <span
                            class="${riskClass}"
                        >

                            ${riskLevel}

                        </span>

                    </td>

                `;


                // ==================================
                // CLICK ENTITY
                // ==================================

                row.addEventListener(
                    "click",
                    function () {

                        showEntityDetails(
                            entity
                        );

                    }
                );


                entityTableBody.appendChild(
                    row
                );

            }
        );

}


// ==========================================
// FILTER ENTITIES
// ==========================================

function filterEntities() {

    const searchText =
        entitySearch
            ? entitySearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedRisk =
        entityRiskFilter
            ? entityRiskFilter.value
            : "ALL";


    const filtered =
        allEntities.filter(
            entity => {


                // ==================================
                // ENTITY ID
                // ==================================

                const entityId =
                    String(
                        entity.entity_id || ""
                    ).toLowerCase();


                // ==================================
                // RISK
                // ==================================

                const risk =
                    String(
                        entity.risk_level || ""
                    ).toUpperCase();


                // ==================================
                // SEARCH MATCH
                // ==================================

                const matchesSearch =
                    entityId.includes(
                        searchText
                    );


                // ==================================
                // RISK MATCH
                // ==================================

                const matchesRisk =
                    selectedRisk === "ALL" ||
                    risk === selectedRisk;


                return (
                    matchesSearch &&
                    matchesRisk
                );

            }
        );


    console.log(
        "Filtered entities:",
        filtered.length
    );


    renderEntities(
        filtered
    );

}


// ==========================================
// SEARCH EVENT
// ==========================================

if (entitySearch) {

    entitySearch.addEventListener(
        "input",
        filterEntities
    );

}


// ==========================================
// RISK FILTER EVENT
// ==========================================

if (entityRiskFilter) {

    entityRiskFilter.addEventListener(
        "change",
        filterEntities
    );

}


// ==========================================
// CLEAR FILTER BUTTON
// ==========================================

if (clearEntityFilters) {

    clearEntityFilters.addEventListener(
        "click",
        function () {


            if (entitySearch) {

                entitySearch.value = "";

            }


            if (entityRiskFilter) {

                entityRiskFilter.value = "ALL";

            }


            renderEntities(
                allEntities
            );

        }
    );

}


// ==========================================
// ENTITY INVESTIGATION
// ==========================================

function showEntityDetails(
    entity
) {


    // ======================================
    // GET VALUES
    // ======================================

    const entityId =
        entity.entity_id ||
        "Unknown";


    const cluster =
        entity.entity_cluster !== undefined
            ? entity.entity_cluster
            : "-";


    const transactions =
        Number(
            entity.transaction_count || 0
        );


    const totalBTC =
        Number(
            entity.total_btc || 0
        ).toFixed(4);


    const averageRisk =
        Number(
            entity.average_risk || 0
        ).toFixed(1);


    const highestRisk =
        Number(
            entity.highest_risk || 0
        ).toFixed(1);


    const riskLevel =
        String(
            entity.risk_level || "UNKNOWN"
        ).toUpperCase();


    // ======================================
    // UPDATE INVESTIGATION PANEL
    // ======================================

    const selectedEntityId =
        document.getElementById(
            "selectedEntityId"
        );


    const selectedCluster =
        document.getElementById(
            "selectedCluster"
        );


    const selectedBTC =
        document.getElementById(
            "selectedBTC"
        );


    const selectedRisk =
        document.getElementById(
            "selectedRisk"
        );


    const investigationRisk =
        document.getElementById(
            "entityInvestigationRisk"
        );


    const entityEvidence =
        document.getElementById(
            "entityEvidence"
        );


    // ======================================
    // UPDATE VALUES
    // ======================================

    if (selectedEntityId) {

        selectedEntityId.textContent =
            entityId;

    }


    if (selectedCluster) {

        selectedCluster.textContent =
            cluster;

    }


    if (selectedBTC) {

        selectedBTC.textContent =
            totalBTC + " BTC";

    }


    if (selectedRisk) {

        selectedRisk.textContent =
            highestRisk;

    }


    // ======================================
    // UPDATE RISK BADGE
    // ======================================

    if (investigationRisk) {

        investigationRisk.textContent =
            riskLevel;


        investigationRisk.className =
            "risk-badge large";


        if (riskLevel === "HIGH") {

            investigationRisk.classList.add(
                "high"
            );

        }

        else if (
            riskLevel === "MEDIUM"
        ) {

            investigationRisk.classList.add(
                "medium"
            );

        }

        else {

            investigationRisk.classList.add(
                "low"
            );

        }

    }


    // ======================================
    // UPDATE EVIDENCE
    // ======================================

    if (entityEvidence) {

        entityEvidence.innerHTML = `

            <div>

                <span>✓</span>

                Entity contains
                <strong>
                    ${transactions}
                </strong>
                transaction(s)

            </div>


            <div>

                <span>✓</span>

                Average risk score:
                <strong>
                    ${averageRisk}
                </strong>
                / 100

            </div>


            <div>

                <span>✓</span>

                Highest transaction risk:
                <strong>
                    ${highestRisk}
                </strong>
                / 100

            </div>


            <div>

                <span>✓</span>

                DBSCAN cluster:
                <strong>
                    ${cluster}
                </strong>

            </div>


            <div>

                <span>✓</span>

                Entity classification:
                <strong>
                    ${riskLevel}
                </strong>

            </div>

        `;

    }


    // ======================================
    // LOG
    // ======================================

    console.log(
        "Selected entity:",
        entity
    );

}


// ==========================================
// START ENTITY ANALYSIS
// ==========================================

loadEntities();


console.log(
    "Entity Analysis Loaded"
);