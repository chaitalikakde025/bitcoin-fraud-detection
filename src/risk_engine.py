# ==========================================
# RISK ENGINE
# AI/ML FRAUD RISK SCORING
# ==========================================


import pandas as pd


# ==========================================
# CALCULATE RAW RISK SCORE
# ==========================================

def calculate_raw_score(row):

    score = 0.0
    reasons = []

    # ==========================================
    # FEATURE PERCENTILES
    # ==========================================

    amount_percentile = float(
        row["amount_percentile"]
    )

    velocity_percentile = float(
        row["velocity_percentile"]
    )

    fanout_percentile = float(
        row["fanout_percentile"]
    )

    peeling_percentile = float(
        row["peeling_percentile"]
    )

    ip_percentile = float(
        row["ip_percentile"]
    )


    # ==========================================
    # WEIGHTED RISK COMPONENTS
    # ==========================================

    amount_score = (
        amount_percentile * 25
    )

    velocity_score = (
        velocity_percentile * 20
    )

    fanout_score = (
        fanout_percentile * 15
    )

    peeling_score = (
        peeling_percentile * 20
    )

    ip_score = (
        ip_percentile * 10
    )


    score += amount_score
    score += velocity_score
    score += fanout_score
    score += peeling_score
    score += ip_score


    # ==========================================
    # AI ANOMALY SIGNAL
    # ==========================================

    if (
        int(row["anomaly_prediction"])
        == -1
    ):

        score += 10

        reasons.append(
            "AI anomaly detected"
        )


    # ==========================================
    # EVIDENCE: TRANSACTION AMOUNT
    # ==========================================

    if amount_percentile >= 0.90:

        reasons.append(
            "Unusually high transaction amount"
        )

    elif amount_percentile >= 0.70:

        reasons.append(
            "Elevated transaction amount"
        )


    # ==========================================
    # EVIDENCE: VELOCITY
    # ==========================================

    if velocity_percentile >= 0.90:

        reasons.append(
            "Very high transaction velocity"
        )

    elif velocity_percentile >= 0.70:

        reasons.append(
            "Elevated transaction velocity"
        )


    # ==========================================
    # EVIDENCE: FAN-OUT
    # ==========================================

    if fanout_percentile >= 0.90:

        reasons.append(
            "Very high fan-out pattern"
        )

    elif fanout_percentile >= 0.70:

        reasons.append(
            "Suspicious fan-out pattern"
        )


    # ==========================================
    # EVIDENCE: PEELING
    # ==========================================

    if peeling_percentile >= 0.90:

        reasons.append(
            "Strong peeling-chain pattern"
        )

    elif peeling_percentile >= 0.70:

        reasons.append(
            "Possible peeling-chain pattern"
        )


    # ==========================================
    # EVIDENCE: SOURCE IP
    # ==========================================

    if ip_percentile >= 0.90:

        reasons.append(
            "Very high source-IP activity"
        )

    elif ip_percentile >= 0.70:

        reasons.append(
            "Elevated source-IP activity"
        )


    # ==========================================
    # DEFAULT EVIDENCE
    # ==========================================

    if not reasons:

        reasons.append(
            "Normal transaction behavior"
        )


    return score, reasons


# ==========================================
# APPLY RISK ENGINE
# ==========================================

def apply_risk_engine(df):

    # ==========================================
    # COPY DATAFRAME
    # ==========================================

    df = df.copy()


    # ==========================================
    # CALCULATE FEATURE PERCENTILES
    #
    # method="first" prevents large groups of
    # identical percentile values.
    # ==========================================

    df["amount_percentile"] = (
        df["amount"]
        .rank(
            method="first",
            pct=True
        )
    )

    df["velocity_percentile"] = (
        df["velocity"]
        .rank(
            method="first",
            pct=True
        )
    )

    df["fanout_percentile"] = (
        df["fan_out"]
        .rank(
            method="first",
            pct=True
        )
    )

    df["peeling_percentile"] = (
        df["peeling_score"]
        .rank(
            method="first",
            pct=True
        )
    )

    df["ip_percentile"] = (
        df["ip_frequency"]
        .rank(
            method="first",
            pct=True
        )
    )


    # ==========================================
    # CALCULATE RAW SCORES
    # ==========================================

    raw_results = df.apply(
        calculate_raw_score,
        axis=1
    )


    df["raw_risk_score"] = [
        result[0]
        for result in raw_results
    ]


    df["risk_reasons"] = [
        result[1]
        for result in raw_results
    ]


    # ==========================================
    # CREATE UNIQUE RISK RANK
    #
    # This prevents the dashboard from showing
    # hundreds of identical scores such as 64,
    # 70 or 97.
    # ==========================================

    df["risk_rank"] = (
        df["raw_risk_score"]
        .rank(
            method="first",
            pct=True
        )
    )


    # ==========================================
    # CONVERT RISK RANK TO 0-100 SCORE
    #
    # Minimum approximately 5
    # Maximum approximately 95
    # ==========================================

    df["risk_score"] = (
        5
        + (
            df["risk_rank"] * 90
        )
    ).round(1)


    # ==========================================
    # RISK LEVEL DISTRIBUTION
    #
    # Bottom 70%  = LOW
    # Next 20%    = MEDIUM
    # Top 10%     = HIGH
    #
    # For 5,000 transactions:
    #
    # LOW     ≈ 3,500
    # MEDIUM  ≈ 1,000
    # HIGH    ≈   500
    # ==========================================

    df["risk_level"] = "LOW"


    df.loc[
        df["risk_rank"] >= 0.70,
        "risk_level"
    ] = "MEDIUM"


    df.loc[
        df["risk_rank"] >= 0.90,
        "risk_level"
    ] = "HIGH"


    # ==========================================
    # IMPROVE EVIDENCE FOR HIGH-RISK RECORDS
    # ==========================================

    high_risk_mask = (
        df["risk_level"] == "HIGH"
    )


    # If a high-risk transaction somehow has
    # very little evidence, add a general reason.

    for index in df.index[high_risk_mask]:

        reasons = df.at[
            index,
            "risk_reasons"
        ]


        if not isinstance(
            reasons,
            list
        ):

            reasons = []


        if len(reasons) == 0:

            reasons.append(
                "Multiple high-risk behavioral signals"
            )


        df.at[
            index,
            "risk_reasons"
        ] = reasons


    # ==========================================
    # MEDIUM-RISK EVIDENCE
    # ==========================================

    medium_risk_mask = (
        df["risk_level"] == "MEDIUM"
    )


    for index in df.index[medium_risk_mask]:

        reasons = df.at[
            index,
            "risk_reasons"
        ]


        if not isinstance(
            reasons,
            list
        ):

            reasons = []


        if len(reasons) == 0:

            reasons.append(
                "Moderate transaction risk indicators"
            )


        df.at[
            index,
            "risk_reasons"
        ] = reasons


    # ==========================================
    # LOW-RISK EVIDENCE
    # ==========================================

    low_risk_mask = (
        df["risk_level"] == "LOW"
    )


    for index in df.index[low_risk_mask]:

        reasons = df.at[
            index,
            "risk_reasons"
        ]


        if not isinstance(
            reasons,
            list
        ):

            reasons = []


        if len(reasons) == 0:

            reasons.append(
                "Normal transaction behavior"
            )


        df.at[
            index,
            "risk_reasons"
        ] = reasons


    # ==========================================
    # REMOVE INTERNAL CALCULATION COLUMNS
    # ==========================================

    df.drop(
        columns=[
            "amount_percentile",
            "velocity_percentile",
            "fanout_percentile",
            "peeling_percentile",
            "ip_percentile",
            "raw_risk_score",
            "risk_rank"
        ],
        inplace=True,
        errors="ignore"
    )


    # ==========================================
    # FINAL COLUMN ORDER
    # ==========================================

    preferred_columns = [
        "timestamp",
        "src_ip",
        "dst_ip",
        "src_port",
        "dst_port",
        "txid",
        "input_addresses",
        "output_addresses",
        "input_amounts",
        "output_amounts",
        "geo_country",
        "asn",
        "label",
        "amount",
        "input_count",
        "output_count",
        "velocity",
        "fan_out",
        "peeling_score",
        "ip_frequency",
        "anomaly_prediction",
        "entity_cluster",
        "risk_score",
        "risk_level",
        "risk_reasons"
    ]


    existing_columns = [
        column
        for column in preferred_columns
        if column in df.columns
    ]


    remaining_columns = [
        column
        for column in df.columns
        if column not in existing_columns
    ]


    df = df[
        existing_columns
        + remaining_columns
    ]


    # ==========================================
    # RETURN FINAL DATA
    # ==========================================

    return df