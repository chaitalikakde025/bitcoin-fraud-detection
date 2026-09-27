from ingestion import load_data
from features import create_features
from anomaly import detect_anomalies
from clustering import cluster_entities
from peeling import apply_peeling_detection
from risk_engine import apply_risk_engine


def run_pipeline():

    print("\n==============================")
    print("BITCOIN FRAUD DETECTION")
    print("==============================")

    # 1. Load dataset

    print("\n[1] Loading dataset...")

    df = load_data()

    print(
        "Transactions:",
        len(df)
    )

    # 2. Feature engineering

    print(
        "\n[2] Creating features..."
    )

    df = create_features(df)

    # 3. Anomaly detection

    print(
        "\n[3] Running anomaly detection..."
    )

    _, df = detect_anomalies(df)

    # 4. Entity clustering

    print(
        "\n[4] Running entity clustering..."
    )

    _, df = cluster_entities(df)

    # 5. Peeling detection

    print(
        "\n[5] Running peeling detection..."
    )

    df = apply_peeling_detection(df)

    # 6. Risk scoring

    print(
        "\n[6] Calculating risk..."
    )

    df = apply_risk_engine(df)

    print(
        "\n=============================="
    )

    print("ANALYSIS COMPLETE")

    print(
        "=============================="
    )

    # Show highest risk transactions

    high_risk = df.sort_values(
        "risk_score",
        ascending=False
    ).head(10)

    print(
        "\nTOP 10 HIGH-RISK TRANSACTIONS:\n"
    )

    for _, row in high_risk.iterrows():

        print(
            "TXID:",
            row["txid"]
        )

        print(
            "Risk:",
            row["risk_score"],
            "/ 100"
        )

        print(
            "Level:",
            row["risk_level"]
        )

        print(
            "Reasons:",
            row["risk_reasons"]
        )

        print("-" * 60)

    # Save complete analysis results
    df.to_csv(
        "data/analyzed_transactions.csv",
        index=False
    )

    print(
        "\nResults saved to:"
        " data/analyzed_transactions.csv"
    )

    return df


if __name__ == "__main__":

    run_pipeline()