def calculate_peeling_score(row):

    score = 0

    reasons = []

    # Many outputs
    if row["output_count"] >= 5:

        score += 30

        reasons.append(
            "High number of output addresses"
        )

    # Fan-out
    if row["fan_out"] == 1:

        score += 25

        reasons.append(
            "Fan-out pattern detected"
        )

    # Input/output relationship
    if row["io_ratio"] >= 3:

        score += 20

        reasons.append(
            "Unusual input/output ratio"
        )

    # High velocity
    if row["velocity"] > 0.1:

        score += 15

        reasons.append(
            "High transaction velocity"
        )

    # Multiple inputs
    if row["input_count"] >= 3:

        score += 10

        reasons.append(
            "Multiple input addresses"
        )

    return min(score, 100), reasons


def apply_peeling_detection(df):

    results = df.apply(
        calculate_peeling_score,
        axis=1
    )

    df["peeling_score"] = [
        result[0]
        for result in results
    ]

    df["peeling_reasons"] = [
        result[1]
        for result in results
    ]

    return df