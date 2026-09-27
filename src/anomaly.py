from sklearn.ensemble import IsolationForest

from ingestion import load_data
from features import create_features


FEATURE_COLUMNS = [
    "amount",
    "fee",
    "input_count",
    "output_count",
    "io_ratio",
    "velocity",
    "fan_out",
    "ip_frequency",
    "country_frequency",
    "asn_frequency"
]


def detect_anomalies(df):

    X = df[
        FEATURE_COLUMNS
    ].fillna(0)

    model = IsolationForest(
        n_estimators=200,
        contamination=0.15,
        random_state=42
    )

    model.fit(X)

    df["anomaly_prediction"] = (
        model.predict(X)
    )

    df["anomaly_score"] = (
        -model.score_samples(X)
    )

    return model, df


if __name__ == "__main__":

    df = load_data()

    df = create_features(df)

    model, df = detect_anomalies(df)

    print("\nAnomaly detection complete!")

    print(
        df[
            [
                "txid",
                "amount",
                "output_count",
                "anomaly_prediction",
                "anomaly_score"
            ]
        ].head(20)
    )