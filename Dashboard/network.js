// ============================================================
// FRAUDGUARD - NETWORK ACTIVITY
// ============================================================

const API_URL = "http://127.0.0.1:8000";

let allEntities = [];
let filteredEntities = [];


// ============================================================
// LOAD ENTITIES
// ============================================================

async function loadNetworkData() {

    try {

        const response = await fetch(`${API_URL}/entities`);

        if (!response.ok) {
            throw new Error("Failed to load entity data");
        }

        allEntities = await response.json();

        if (!Array.isArray(allEntities)) {
            throw new Error("Invalid entity data");
        }

        updateNetworkSummary();

        applyNetworkFilters();

    } catch (error) {

        console.error("Network data error:", error);

        const graph = document.getElementById("networkGraph");

        if (graph) {
            graph.innerHTML = `
                <div style="
                    padding:40px;
                    text-align:center;
                    color:#e4515a;
                ">
                    Unable to load network data.
                    <br><br>
                    Make sure the FastAPI server is running.
                </div>
            `;
        }

    }

}


// ============================================================
// SUMMARY CARDS
// ============================================================

function updateNetworkSummary() {

    const total = allEntities.length;

    const high = allEntities.filter(
        entity => String(entity.risk_level).toUpperCase() === "HIGH"
    ).length;

    const medium = allEntities.filter(
        entity => String(entity.risk_level).toUpperCase() === "MEDIUM"
    ).length;

    const low = allEntities.filter(
        entity => String(entity.risk_level).toUpperCase() === "LOW"
    ).length;


    const totalElement = document.getElementById("networkNodes");
    const highElement = document.getElementById("networkHighRisk");
    const connectionElement = document.getElementById("networkConnections");


    if (totalElement) {
        totalElement.textContent = total.toLocaleString();
    }

    if (highElement) {
        highElement.textContent = high.toLocaleString();
    }

    if (connectionElement) {
        connectionElement.textContent = total.toLocaleString();
    }

}


// ============================================================
// GET FILTERED ENTITIES
// ============================================================

function applyNetworkFilters() {

    const searchInput = document.getElementById("networkSearch");
    const riskFilter = document.getElementById("networkRiskFilter");


    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedRisk = riskFilter
        ? riskFilter.value.toUpperCase()
        : "ALL";


    filteredEntities = allEntities.filter(entity => {

        const entityId = String(
            entity.entity_id || ""
        ).toLowerCase();

        const riskLevel = String(
            entity.risk_level || ""
        ).toUpperCase();


        // ----------------------------------------------------
        // SEARCH FILTER
        // ----------------------------------------------------

        const matchesSearch =
            searchText === "" ||
            entityId.includes(searchText);


        // ----------------------------------------------------
        // RISK FILTER
        // IMPORTANT:
        // Only matching risk level is displayed.
        // ----------------------------------------------------

        const matchesRisk =
            selectedRisk === "ALL" ||
            riskLevel === selectedRisk;


        return matchesSearch && matchesRisk;

    });


    drawNetwork();

}


// ============================================================
// DRAW NETWORK
// ============================================================

function drawNetwork() {

    const graph = document.getElementById("networkGraph");

    if (!graph) {
        return;
    }


    graph.innerHTML = "";


    if (filteredEntities.length === 0) {

        graph.innerHTML = `
            <div style="
                padding:50px;
                text-align:center;
                color:#64748b;
                font-size:15px;
            ">
                No entities found for the selected filter.
            </div>
        `;

        return;
    }


    // --------------------------------------------------------
    // We do not display all 23,777 nodes at once.
    // That would make the browser very slow.
    //
    // Display a maximum of 35 nodes.
    // --------------------------------------------------------

    const displayEntities = filteredEntities.slice(0, 35);


    // --------------------------------------------------------
    // GRAPH SIZE
    // --------------------------------------------------------

    const width = 820;
    const height = 500;

    const centerX = width / 2;
    const centerY = height / 2;


    // --------------------------------------------------------
    // CREATE SVG
    // --------------------------------------------------------

    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );


    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);


    svg.style.display = "block";


    // --------------------------------------------------------
    // CENTER NODE
    // --------------------------------------------------------

    const centerEntity = displayEntities[0];


    const centerNode = createNode(
        svg,
        centerX,
        centerY,
        centerEntity,
        true
    );


    // --------------------------------------------------------
    // CREATE OUTER NODES
    // --------------------------------------------------------

    const radius = 185;


    displayEntities.slice(1).forEach((entity, index) => {

        const totalOuterNodes = displayEntities.length - 1;

        const angle =
            (index / totalOuterNodes) * Math.PI * 2
            - Math.PI / 2;


        const x =
            centerX + Math.cos(angle) * radius;

        const y =
            centerY + Math.sin(angle) * radius;


        // ----------------------------------------------------
        // CONNECT NODE TO CENTER
        // ----------------------------------------------------

        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );


        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);


        line.setAttribute("stroke", "#d9e1ec");
        line.setAttribute("stroke-width", "2");


        svg.appendChild(line);


        // ----------------------------------------------------
        // CREATE NODE
        // ----------------------------------------------------

        createNode(
            svg,
            x,
            y,
            entity,
            false
        );

    });


    graph.appendChild(svg);


    // --------------------------------------------------------
    // INFORMATION TEXT
    // --------------------------------------------------------

    const info = document.createElement("div");

    info.style.textAlign = "center";
    info.style.padding = "10px 15px 15px";
    info.style.color = "#64748b";
    info.style.fontSize = "12px";


    if (filteredEntities.length > 35) {

        info.textContent =
            `Showing 35 of ${filteredEntities.length.toLocaleString()} matching entities`;

    } else {

        info.textContent =
            `Showing ${filteredEntities.length.toLocaleString()} matching entities`;

    }


    graph.appendChild(info);

}


// ============================================================
// CREATE NODE
// ============================================================

function createNode(svg, x, y, entity, isCenter) {

    const group = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );


    group.style.cursor = "pointer";


    // --------------------------------------------------------
    // RISK LEVEL
    // --------------------------------------------------------

    const riskLevel = String(
        entity.risk_level || "LOW"
    ).toUpperCase();


    // --------------------------------------------------------
    // NODE COLOR
    // --------------------------------------------------------

    let nodeColor = "#35b96b";


    if (riskLevel === "HIGH") {

        nodeColor = "#e4515a";

    } else if (riskLevel === "MEDIUM") {

        nodeColor = "#f1a33b";

    } else {

        nodeColor = "#35b96b";

    }


    // --------------------------------------------------------
    // NODE SIZE
    // --------------------------------------------------------

    const radius = isCenter ? 19 : 10;


    // --------------------------------------------------------
    // CIRCLE
    // --------------------------------------------------------

    const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );


    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);


    circle.setAttribute("fill", nodeColor);
    circle.setAttribute("stroke", "#ffffff");
    circle.setAttribute("stroke-width", "3");


    // --------------------------------------------------------
    // HOVER EFFECT
    // --------------------------------------------------------

    circle.addEventListener("mouseenter", function () {

        circle.setAttribute(
            "r",
            isCenter ? 23 : 14
        );

    });


    circle.addEventListener("mouseleave", function () {

        circle.setAttribute(
            "r",
            radius
        );

    });


    // --------------------------------------------------------
    // CLICK
    // --------------------------------------------------------

    circle.addEventListener("click", function () {

        showNetworkInvestigation(entity);

    });


    group.appendChild(circle);


    // --------------------------------------------------------
    // ENTITY ID LABEL
    // --------------------------------------------------------

    const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );


    const entityId = String(
        entity.entity_id || "Unknown"
    );


    const shortId =
        entityId.length > 12
            ? entityId.substring(0, 12) + "..."
            : entityId;


    text.setAttribute("x", x);
    text.setAttribute(
        "y",
        y - (isCenter ? 27 : 16)
    );


    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", isCenter ? "12" : "9");
    text.setAttribute("font-weight", isCenter ? "700" : "400");
    text.setAttribute("fill", "#1e293b");


    text.textContent = shortId;


    group.appendChild(text);


    // --------------------------------------------------------
    // TOOLTIP
    // --------------------------------------------------------

    const title = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "title"
    );


    title.textContent =
        `Entity: ${entityId}
Risk: ${riskLevel}
Average Risk: ${entity.average_risk || 0}/100
Transactions: ${entity.transaction_count || 0}
Cluster: ${entity.entity_cluster ?? "-"}`;


    group.appendChild(title);


    svg.appendChild(group);

    return group;

}


// ============================================================
// NETWORK INVESTIGATION
// ============================================================

function showNetworkInvestigation(entity) {

    const investigationRisk =
        document.getElementById("selectedNetworkRisk");

    const entityId =
        document.getElementById("networkEntityId");

    const cluster =
        document.getElementById("networkCluster");

    const transactions =
        document.getElementById("networkTransactionCount");

    const riskScore =
        document.getElementById("networkRiskScore");

    const evidence =
        document.getElementById("networkEvidence");


    const riskLevel = String(
        entity.risk_level || "LOW"
    ).toUpperCase();


    // --------------------------------------------------------
    // RISK BADGE
    // --------------------------------------------------------

    if (investigationRisk) {

        investigationRisk.textContent = riskLevel;

        investigationRisk.className =
            "risk-badge " +
            riskLevel.toLowerCase();

    }


    // --------------------------------------------------------
    // ENTITY ID
    // --------------------------------------------------------

    if (entityId) {

        entityId.textContent =
            entity.entity_id || "-";

    }


    // --------------------------------------------------------
    // CLUSTER
    // --------------------------------------------------------

    if (cluster) {

        cluster.textContent =
            entity.entity_cluster ?? "-";

    }


    // --------------------------------------------------------
    // TRANSACTION COUNT
    // --------------------------------------------------------

    if (transactions) {

        transactions.textContent =
            entity.transaction_count || 0;

    }


    // --------------------------------------------------------
    // RISK SCORE
    // --------------------------------------------------------

    if (riskScore) {

        riskScore.textContent =
            entity.average_risk ?? 0;

    }


    // --------------------------------------------------------
    // EVIDENCE
    // --------------------------------------------------------

    if (evidence) {

        evidence.innerHTML = `

            This entity is involved in
            <strong>
                ${entity.transaction_count || 0}
            </strong>
            transaction(s).

            <br><br>

            Average risk score:
            <strong>
                ${entity.average_risk ?? 0}/100
            </strong>.

            <br>

            Highest observed risk:
            <strong>
                ${entity.highest_risk ?? 0}/100
            </strong>.

            <br>

            High-risk transactions:
            ${entity.high_risk_count || 0}.

            <br>

            Medium-risk transactions:
            ${entity.medium_risk_count || 0}.

            <br>

            Low-risk transactions:
            ${entity.low_risk_count || 0}.

        `;

    }


    // --------------------------------------------------------
    // SCROLL TO INVESTIGATION
    // --------------------------------------------------------

    const investigation =
        document.getElementById("networkInvestigation");


    if (investigation) {

        investigation.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// ============================================================
// SEARCH
// ============================================================

const searchInput =
    document.getElementById("networkSearch");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        applyNetworkFilters
    );

}


// ============================================================
// RISK FILTER
// ============================================================

const riskFilter =
    document.getElementById("networkRiskFilter");


if (riskFilter) {

    riskFilter.addEventListener(
        "change",
        applyNetworkFilters
    );

}


// ============================================================
// CLEAR BUTTON
// ============================================================

const clearButton =
    document.getElementById("clearNetworkFilters");


if (clearButton) {

    clearButton.addEventListener(
        "click",
        function () {

            if (searchInput) {
                searchInput.value = "";
            }

            if (riskFilter) {
                riskFilter.value = "ALL";
            }

            applyNetworkFilters();

        }
    );

}


// ============================================================
// START NETWORK
// ============================================================

loadNetworkData();