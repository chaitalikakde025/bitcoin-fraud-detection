import pandas as pd


def count_items(value):

    if pd.isna(value):
        return 0

    return len(
        str(value).split("|")
    )


def sum_amounts(value):

    if pd.isna(value):
        return 0.0

    return sum(
        float(x)
        for x in str(value).split("|")
    )


def create_features(df):

    df = df.copy()

    # --------------------------
    # Transaction structure
    # --------------------------

    df["input_count"] = (
        df["input_addresses"]
        .apply(count_items)
    )

    df["output_count"] = (
        df["output_addresses"]
        .apply(count_items)
    )

    # --------------------------
    # Amount
    # --------------------------

    df["input_total"] = (
        df["input_amounts"]
        .apply(sum_amounts)
    )

    df["output_total"] = (
        df["output_amounts"]
        .apply(sum_amounts)
    )

    df["amount"] = df["output_total"]

    # --------------------------
    # Fee
    # --------------------------

    df["fee"] = (
        df["input_total"]
        -
        df["output_total"]
    )

    df["fee"] = df["fee"].clip(
        lower=0
    )

    # --------------------------
    # Input / output ratio
    # --------------------------

    df["io_ratio"] = (
        df["output_count"]
        /
        df["input_count"].replace(
            0,
            1
        )
    )

    # --------------------------
    # Time / velocity
    # --------------------------

    df = df.sort_values(
        "timestamp"
    )

    df["time_difference"] = (
        df["timestamp"]
        .diff()
        .dt.total_seconds()
    )

    df["time_difference"] = (
        df["time_difference"]
        .fillna(1)
        .clip(lower=1)
    )

    df["velocity"] = (
        1 /
        df["time_difference"]
    )

    # --------------------------
    # Fan-out
    # --------------------------

    df["fan_out"] = (
        df["output_count"] >= 5
    ).astype(int)

    # --------------------------
    # IP frequency
    # --------------------------

    df["ip_frequency"] = (
        df.groupby("src_ip")["txid"]
        .transform("count")
    )

    # --------------------------
    # Country frequency
    # --------------------------

    df["country_frequency"] = (
        df.groupby("geo_country")["txid"]
        .transform("count")
    )

    # --------------------------
    # ASN frequency
    # --------------------------

    df["asn_frequency"] = (
        df.groupby("asn")["txid"]
        .transform("count")
    )

    return df
if __name__ == "__main__":

    from ingestion import load_data

    df = load_data()

    df = create_features(df)

    print("\nFeatures generated!")

    print(
        df[
            [
                "txid",
                "amount",
                "fee",
                "input_count",
                "output_count",
                "io_ratio",
                "velocity",
                "fan_out"
            ]
        ].head()
    )