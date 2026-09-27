import pandas as pd


DATA_PATH = "data/synthetic_transactions.csv"


def load_data():

    df = pd.read_csv(DATA_PATH)

    df["timestamp"] = pd.to_datetime(
        df["timestamp"]
    )

    return df


if __name__ == "__main__":

    df = load_data()

    print("Dataset loaded successfully!")

    print(
        "Number of transactions:",
        len(df)
    )

    print(
        "\nColumns:"
    )

    print(
        df.columns.tolist()
    )

    print(
        "\nFirst 5 transactions:"
    )

    print(
        df.head()
    )