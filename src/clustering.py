from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

from ingestion import load_data
from features import create_features


CLUSTER_FEATURES = [
    "amount",
    "input_count",
    "output_count",
    "io_ratio",
    "velocity",
    "ip_frequency"
]


def cluster_entities(df):

    X = df[
        CLUSTER_FEATURES
    ].fillna(0)

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    model = DBSCAN(
        eps=0.8,
        min_samples=5
    )

    df["entity_cluster"] = (
        model.fit_predict(X_scaled)
    )

    return model, df


if __name__ == "__main__":

    df = load_data()

    df = create_features(df)

    model, df = cluster_entities(df)

    print("\nEntity clustering complete!")

    print(
        df[
            [
                "txid",
                "entity_cluster"
            ]
        ].head(20)
    )