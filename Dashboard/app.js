// ==========================================
// FRAUD DETECTION DASHBOARD
// ==========================================


// ==========================================
// RISK DISTRIBUTION CHART
// ==========================================

const riskCanvas = document.getElementById("riskChart");

let riskChart = null;

if (riskCanvas) {

    const riskCtx = riskCanvas.getContext("2d");

    riskChart = new Chart(riskCtx, {

        type: "doughnut",

        data: {

            labels: [
                "Low Risk",
                "Medium Risk",
                "High Risk"
            ],

            datasets: [{

                data: [
                    0,
                    0,
                    0
                ],

                backgroundColor: [
                    "#35b96b",
                    "#f1a33b",
                    "#e4515a"
                ],

                borderWidth: 0
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "72%",

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        usePointStyle: true,

                        padding: 18,

                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}


// ==========================================
// TRANSACTION ACTIVITY CHART
// ==========================================

const activityCanvas =
    document.getElementById("activityChart");

let activityChart = null;

if (activityCanvas) {

    const activityCtx =
        activityCanvas.getContext("2d");

    activityChart = new Chart(
        activityCtx,
        {

            type: "bar",

            data: {

                labels: [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun"
                ],

                datasets: [

                    // ==================================
                    // TOTAL TRANSACTIONS
                    // ==================================

                    {

                        type: "bar",

                        label:
                            "Total Transactions",

                        data: [
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0
                        ],

                        backgroundColor:
                            "rgba(57,116,220,0.65)",

                        borderRadius: 6,

                        barPercentage: 0.55,

                        categoryPercentage: 0.65
                    },


                    // ==================================
                    // HIGH RISK ALERTS
                    // ==================================

                    {

                        type: "line",

                        label:
                            "High-Risk Alerts",

                        data: [
                            0,
                            0,
                            0,
                            0,
                            0,
                            0,
                            0
                        ],

                        borderColor:
                            "#e4515a",

                        backgroundColor:
                            "#e4515a",

                        borderWidth: 3,

                        tension: 0.35,

                        pointRadius: 4,

                        pointHoverRadius: 6,

                        pointBackgroundColor:
                            "#e4515a"
                    }

                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false
                },


                plugins: {

                    legend: {

                        display: true,

                        position: "bottom",

                        labels: {

                            usePointStyle: true,

                            padding: 16,

                            font: {
                                size: 10
                            }
                        }
                    },


                    tooltip: {

                        callbacks: {

                            label: function(context) {

                                return (
                                    context.dataset.label +
                                    ": " +
                                    context.parsed.y
                                );

                            }
                        }
                    }

                },


                scales: {

                    y: {

                        beginAtZero: true,

                        grid: {

                            color:
                                "#eef1f5"
                        },

                        ticks: {

                            font: {
                                size: 9
                            },

                            precision: 0
                        }
                    },


                    x: {

                        grid: {

                            display: false
                        },

                        ticks: {

                            font: {
                                size: 9
                            }
                        }
                    }

                }

            }

        }
    );
}


// ==========================================
// GLOBAL TRANSACTION DATA
// ==========================================

let allTransactions = [];


// ==========================================
// GET RISK CSS CLASS
// ==========================================

function getRiskClass(riskLevel) {

    if (riskLevel === "HIGH") {
        return "high-risk";
    }

    if (riskLevel === "MEDIUM") {
        return "medium-risk";
    }

    return "low-risk";
}


// ==========================================
// CLEAN RISK REASONS
// ==========================================

function cleanReasons(transaction) {

    let reasons = "";


    if (Array.isArray(transaction.risk_reasons)) {

        reasons =
            transaction.risk_reasons.join(" • ");

    }

    else {

        reasons =
            String(
                transaction.risk_reasons ||
                "AI analysis"
            );
    }


    // Remove Python-style list brackets
    reasons = reasons
        .replace(/^\[|\]$/g, "")
        .replace(/'/g, "")
        .trim();


    return reasons;
}


// ==========================================
// GET INITIAL BALANCED TRANSACTIONS
// ==========================================
//
// Initial table:
//
// 4 HIGH
// 3 MEDIUM
// 3 LOW
//
// This makes the dashboard visually balanced.
// ==========================================

function getInitialTransactions() {

    const high =
        allTransactions
            .filter(
                transaction =>
                    transaction.risk_level === "HIGH"
            )
            .sort(
                (a, b) =>
                    Number(b.risk_score) -
                    Number(a.risk_score)
            )
            .slice(0, 4);


    const medium =
        allTransactions
            .filter(
                transaction =>
                    transaction.risk_level === "MEDIUM"
            )
            .sort(
                (a, b) =>
                    Number(b.risk_score) -
                    Number(a.risk_score)
            )
            .slice(0, 3);


    const low =
        allTransactions
            .filter(
                transaction =>
                    transaction.risk_level === "LOW"
            )
            .sort(
                (a, b) =>
                    Number(b.risk_score) -
                    Number(a.risk_score)
            )
            .slice(0, 3);


    return [
        ...high,
        ...medium,
        ...low
    ];
}


// ==========================================
// DISPLAY TRANSACTIONS
// ==========================================

function displayTransactions(transactions) {

    const tableBody =
        document.getElementById(
            "transactionTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    // ======================================
    // NO RESULTS
    // ======================================

    if (transactions.length === 0) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td
                colspan="5"
                style="
                    text-align:center;
                    padding:25px;
                "
            >

                No transactions found.

            </td>

        `;


        tableBody.appendChild(row);

        return;
    }


    // ======================================
    // SHOW FIRST 10
    // ======================================

    transactions
        .slice(0, 10)
        .forEach(transaction => {


            const row =
                document.createElement("tr");


            const riskClass =
                getRiskClass(
                    transaction.risk_level
                );


            const reasons =
                cleanReasons(transaction);


            const shortReasons =
                reasons.length > 55
                    ? reasons.substring(0, 55) + "..."
                    : reasons;


            // ==================================
            // CREATE TABLE ROW
            // ==================================

            row.innerHTML = `

                <td>

                    <strong>

                        ${String(
                            transaction.txid || ""
                        ).substring(0, 12)}...

                    </strong>

                </td>


                <td>

                    ${Number(
                        transaction.amount || 0
                    ).toFixed(4)} BTC

                </td>


                <td class="${riskClass}">

                    ${Number(
                        transaction.risk_score || 0
                    ).toFixed(0)}

                </td>


                <td>

                    <span class="${riskClass}">

                        ${transaction.risk_level || "UNKNOWN"}

                    </span>

                </td>


                <td>

                    ${shortReasons}

                </td>

            `;


            tableBody.appendChild(row);


            // ==================================
            // CLICK TRANSACTION
            // ==================================

            row.addEventListener(
                "click",
                () => {

                    showTransactionDetails(
                        transaction
                    );

                }
            );

        });
}


// ==========================================
// LOAD SUMMARY
// ==========================================

async function loadSummary() {

    try {

        const response =
            await fetch(
                "https://fraudguard-api-ch4d.onrender.com/summary"
            );


        if (!response.ok) {

            throw new Error(
                "API returned status " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Real API Data:",
            data
        );


        // ==================================
        // UPDATE MAIN STAT CARDS
        // ==================================

        const totalElement =
            document.getElementById(
                "totalTransactions"
            );

        if (totalElement) {

            totalElement.textContent =
                Number(
                    data.total_transactions || 0
                ).toLocaleString();

        }


        const highElement =
            document.getElementById(
                "highRisk"
            );

        if (highElement) {

            highElement.textContent =
                Number(
                    data.high_risk || 0
                ).toLocaleString();

        }


        const mediumElement =
            document.getElementById(
                "mediumRisk"
            );

        if (mediumElement) {

            mediumElement.textContent =
                Number(
                    data.medium_risk || 0
                ).toLocaleString();

        }


        const lowElement =
            document.getElementById(
                "lowRisk"
            );

        if (lowElement) {

            lowElement.textContent =
                Number(
                    data.low_risk || 0
                ).toLocaleString();

        }


        // ==================================
        // UPDATE RISK DISTRIBUTION CHART
        // ==================================

        if (riskChart) {

            riskChart.data.datasets[0].data = [

                Number(data.low_risk || 0),

                Number(data.medium_risk || 0),

                Number(data.high_risk || 0)

            ];


            riskChart.update();

        }


        // ==================================
        // LOAD ACTIVITY DATA
        // ==================================

        const activityResponse =
            await fetch(
                "https://fraudguard-api-ch4d.onrender.com/activity"
            );


        if (!activityResponse.ok) {

            throw new Error(
                "Activity API returned status " +
                activityResponse.status
            );

        }


        const activityData =
            await activityResponse.json();


        console.log(
            "Real Activity Data:",
            activityData
        );


        // ==================================
        // UPDATE ACTIVITY CHART
        // ==================================

        if (activityChart) {

            activityChart.data.labels =
                activityData.labels || [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun"
                ];


            // Supports the new API
            if (
                activityData.transaction_counts
            ) {

                activityChart
                    .data
                    .datasets[0]
                    .data =
                        activityData
                            .transaction_counts;

            }


            // Supports the new API
            if (
                activityData.high_risk_counts
            ) {

                activityChart
                    .data
                    .datasets[1]
                    .data =
                        activityData
                            .high_risk_counts;

            }


            // Backward compatibility
            // with previous activity API
            else if (
                activityData.risk_scores
            ) {

                activityChart
                    .data
                    .datasets[1]
                    .data =
                        activityData.risk_scores;

            }


            activityChart.update();

        }


        console.log(
            "Transaction Activity Chart Updated!"
        );

    }


    catch (error) {

        console.error(
            "Unable to connect to FastAPI:",
            error
        );

    }
}


// ==========================================
// LOAD TRANSACTIONS
// ==========================================

async function loadTransactions() {

    try {

        const response =
            await fetch(
                "https://fraudguard-api-ch4d.onrender.com/transactions"
            );


        if (!response.ok) {

            throw new Error(
                "Transaction API returned status " +
                response.status
            );

        }


        allTransactions =
            await response.json();


        console.log(
            "Transactions loaded:",
            allTransactions.length
        );


        // ==================================
        // INITIAL BALANCED DISPLAY
        // ==================================

        displayTransactions(
            getInitialTransactions()
        );


        // ==================================
        // ENABLE FILTERS
        // ==================================

        setupTransactionFilters();

    }


    catch (error) {

        console.error(
            "Unable to load transactions:",
            error
        );

    }
}


// ==========================================
// SEARCH + FILTER SETUP
// ==========================================

function setupTransactionFilters() {

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );


    const riskFilter =
        document.getElementById(
            "riskFilter"
        );


    const clearButton =
        document.getElementById(
            "clearFilters"
        );


    if (
        !searchInput ||
        !riskFilter ||
        !clearButton
    ) {

        console.error(
            "Search/filter controls not found."
        );

        return;
    }


    // ==================================
    // SEARCH
    // ==================================

    searchInput.addEventListener(
        "input",
        applyFilters
    );


    // ==================================
    // RISK FILTER
    // ==================================

    riskFilter.addEventListener(
        "change",
        applyFilters
    );


    // ==================================
    // CLEAR FILTERS
    // ==================================

    clearButton.addEventListener(
        "click",
        () => {

            searchInput.value = "";

            riskFilter.value = "ALL";


            displayTransactions(
                getInitialTransactions()
            );

        }
    );
}


// ==========================================
// APPLY SEARCH + FILTER
// ==========================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );


    const riskFilter =
        document.getElementById(
            "riskFilter"
        );


    if (!searchInput || !riskFilter) {
        return;
    }


    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedRisk =
        riskFilter.value;


    // ======================================
    // FILTER TRANSACTIONS
    // ======================================

    const filteredTransactions =
        allTransactions.filter(
            transaction => {


                const txid =
                    String(
                        transaction.txid || ""
                    ).toLowerCase();


                const matchesSearch =
                    txid.includes(searchText);


                const matchesRisk =
                    selectedRisk === "ALL" ||
                    transaction.risk_level ===
                        selectedRisk;


                return (
                    matchesSearch &&
                    matchesRisk
                );

            }
        );


    console.log(
        "Filtered transactions:",
        filteredTransactions.length
    );


    displayTransactions(
        filteredTransactions
    );
}


// ==========================================
// SHOW TRANSACTION INVESTIGATION
// ==========================================

function showTransactionDetails(transaction) {

    // ==================================
    // RISK LEVEL
    // ==================================

    const riskLevel =
        transaction.risk_level ||
        "UNKNOWN";


    const riskClass =
        getRiskClass(
            riskLevel
        );


    // ==================================
    // RISK BADGE
    // ==================================

    const riskBadge =
        document.getElementById(
            "investigationRiskLevel"
        );


    if (riskBadge) {

        riskBadge.textContent =
            riskLevel + " RISK";


        riskBadge.className =
            "risk-badge large " +
            riskClass;

    }


    // ==================================
    // RISK SCORE
    // ==================================

    const riskScore =
        Number(
            transaction.risk_score || 0
        );


    const riskScoreElement =
        document.getElementById(
            "investigationRiskScore"
        );


    if (riskScoreElement) {

        riskScoreElement.innerHTML =
            riskScore.toFixed(0) +
            "<span>/100</span>";

    }


    // ==================================
    // SCORE BAR
    // ==================================

    const scoreBar =
        document.getElementById(
            "investigationScoreBar"
        );


    if (scoreBar) {

        scoreBar.style.width =
            Math.min(
                Math.max(riskScore, 0),
                100
            ) + "%";

    }


    // ==================================
    // PEELING SCORE
    // ==================================

    const peelingScore =
        Number(
            transaction.peeling_score || 0
        );


    const peelingElement =
        document.getElementById(
            "investigationPeeling"
        );


    if (peelingElement) {

        peelingElement.textContent =
            peelingScore.toFixed(1);

    }


    const peelingText =
        document.getElementById(
            "investigationPeelingText"
        );


    if (peelingText) {

        if (peelingScore >= 70) {

            peelingText.textContent =
                "Strong pattern detected";

        }

        else if (peelingScore >= 40) {

            peelingText.textContent =
                "Possible pattern detected";

        }

        else {

            peelingText.textContent =
                "Low peeling activity";

        }

    }


    // ==================================
    // AI ANOMALY
    // ==================================

    const anomalyElement =
        document.getElementById(
            "investigationAnomaly"
        );


    if (anomalyElement) {

        if (
            Number(
                transaction.anomaly_prediction
            ) === -1
        ) {

            anomalyElement.textContent =
                "DETECTED";

        }

        else {

            anomalyElement.textContent =
                "NORMAL";

        }

    }


    // ==================================
    // ENTITY CLUSTER
    // ==================================

    const clusterElement =
        document.getElementById(
            "investigationCluster"
        );


    if (clusterElement) {

        if (
            transaction.entity_cluster !==
                undefined &&
            transaction.entity_cluster !==
                null
        ) {

            const cluster =
                Number(
                    transaction.entity_cluster
                );


            if (cluster === -1) {

                clusterElement.textContent =
                    "OUTLIER";

            }

            else {

                clusterElement.textContent =
                    "#" + cluster;

            }

        }

        else {

            clusterElement.textContent =
                "N/A";

        }

    }


    // ==================================
    // TRANSACTION ID
    // ==================================

    const txidElement =
        document.getElementById(
            "investigationTxid"
        );


    if (txidElement) {

        txidElement.textContent =
            transaction.txid ||
            "N/A";

    }


    // ==================================
    // AMOUNT
    // ==================================

    const amountElement =
        document.getElementById(
            "investigationAmount"
        );


    if (amountElement) {

        amountElement.textContent =
            Number(
                transaction.amount || 0
            ).toFixed(4) +
            " BTC";

    }


    // ==================================
    // VELOCITY
    // ==================================

    const velocityElement =
        document.getElementById(
            "investigationVelocity"
        );


    if (velocityElement) {

        velocityElement.textContent =
            transaction.velocity ??
            "N/A";

    }


    // ==================================
    // FAN-OUT
    // ==================================

    const fanoutElement =
        document.getElementById(
            "investigationFanout"
        );


    if (fanoutElement) {

        fanoutElement.textContent =
            transaction.fan_out ??
            "N/A";

    }


    // ==================================
    // COUNTRY
    // ==================================

    const countryElement =
        document.getElementById(
            "investigationCountry"
        );


    if (countryElement) {

        countryElement.textContent =
            transaction.geo_country ||
            "N/A";

    }


    // ==================================
    // ASN
    // ==================================

    const asnElement =
        document.getElementById(
            "investigationASN"
        );


    if (asnElement) {

        asnElement.textContent =
            transaction.asn ||
            "N/A";

    }


    // ==================================
    // EVIDENCE
    // ==================================

    const evidenceContainer =
        document.getElementById(
            "investigationEvidence"
        );


    if (evidenceContainer) {

        evidenceContainer.innerHTML = "";


        let reasons = [];


        if (
            Array.isArray(
                transaction.risk_reasons
            )
        ) {

            reasons =
                transaction.risk_reasons;

        }

        else if (
            transaction.risk_reasons
        ) {

            reasons = [
                String(
                    transaction.risk_reasons
                )
            ];

        }


        // ==================================
        // NO EVIDENCE
        // ==================================

        if (reasons.length === 0) {

            reasons = [
                "Normal transaction behavior"
            ];

        }


        // ==================================
        // DISPLAY EVIDENCE
        // ==================================

        reasons.forEach(reason => {

            const item =
                document.createElement(
                    "div"
                );


            const cleanReason =
                String(reason)
                    .replace(/^\[|\]$/g, "")
                    .replace(/'/g, "")
                    .trim();


            item.innerHTML = `

                <span>
                    ✓
                </span>

                ${cleanReason}

            `;


            evidenceContainer.appendChild(
                item
            );

        });

    }


    // ==================================
    // SCROLL TO INVESTIGATION
    // ==================================

    const investigationPanel =
        document.getElementById(
            "investigationPanel"
        );


    if (investigationPanel) {

        investigationPanel.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }


    console.log(
        "Transaction investigation loaded:",
        transaction
    );
}


// ==========================================
// UPDATE RISK MONITORING
// ==========================================

async function loadRiskMonitoring() {

    try {

        const response =
            await fetch(
                "https://fraudguard-api-ch4d.onrender.com/summary"
            );


        if (!response.ok) {

            throw new Error(
                "Risk monitoring API returned status " +
                response.status
            );

        }


        const data =
            await response.json();


        // ==================================
        // UPDATE ALL HIGH RISK ELEMENTS
        // ==================================

        document
            .querySelectorAll(
                "#monitorHighRisk, #monitoringHighRisk"
            )
            .forEach(element => {

                element.textContent =
                    Number(
                        data.high_risk || 0
                    ).toLocaleString();

            });


        // ==================================
        // UPDATE ALL MEDIUM RISK ELEMENTS
        // ==================================

        document
            .querySelectorAll(
                "#monitorMediumRisk, #monitoringMediumRisk"
            )
            .forEach(element => {

                element.textContent =
                    Number(
                        data.medium_risk || 0
                    ).toLocaleString();

            });


        // ==================================
        // UPDATE ALL LOW RISK ELEMENTS
        // ==================================

        document
            .querySelectorAll(
                "#monitorLowRisk, #monitoringLowRisk"
            )
            .forEach(element => {

                element.textContent =
                    Number(
                        data.low_risk || 0
                    ).toLocaleString();

            });


        // ==================================
        // LOAD TRANSACTIONS FOR HIGHEST SCORE
        // ==================================

        const transactionResponse =
            await fetch(
                "https://fraudguard-api-ch4d.onrender.com/transactions"
            );


        if (!transactionResponse.ok) {

            throw new Error(
                "Transaction API returned status " +
                transactionResponse.status
            );

        }


        const transactions =
            await transactionResponse.json();


        // ==================================
        // FIND HIGHEST RISK SCORE
        // ==================================

        let highestRisk = 0;


        transactions.forEach(
            transaction => {

                const score =
                    Number(
                        transaction.risk_score || 0
                    );


                if (score > highestRisk) {

                    highestRisk = score;

                }

            }
        );


        // ==================================
        // UPDATE ALL HIGHEST SCORE ELEMENTS
        // ==================================

        document
            .querySelectorAll(
                "#highestRiskScore"
            )
            .forEach(element => {

                element.textContent =
                    highestRisk.toFixed(0) +
                    "/100";

            });


        // ==================================
        // SUSPICIOUS TRANSACTIONS
        // ==================================

        const suspiciousCount =
            Number(data.high_risk || 0) +
            Number(data.medium_risk || 0);


        document
            .querySelectorAll(
                "#suspiciousTransactions"
            )
            .forEach(element => {

                element.textContent =
                    suspiciousCount.toLocaleString();

            });


        // ==================================
        // DETECTION STATUS
        // ==================================

        document
            .querySelectorAll(
                "#detectionStatus"
            )
            .forEach(element => {

                element.textContent =
                    "ACTIVE";

            });


        document
            .querySelectorAll(
                "#monitoringAIStatus"
            )
            .forEach(element => {

                element.textContent =
                    "ACTIVE";

            });


        console.log(
            "Risk Monitoring Updated:",
            {
                high: data.high_risk,
                medium: data.medium_risk,
                low: data.low_risk,
                highestRisk: highestRisk
            }
        );

    }


    catch (error) {

        console.error(
            "Unable to load Risk Monitoring:",
            error
        );

    }
}


// ==========================================
// START DASHBOARD
// ==========================================

loadSummary();

loadTransactions();

loadRiskMonitoring();


console.log(
    "Fraud Detection Dashboard Loaded Successfully"
);