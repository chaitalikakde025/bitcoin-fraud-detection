from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="Bitcoin Fraud Detection API",
    description="SIH AI/ML Fraud Detection Prototype",
    version="1.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# DATA PATH
# ==========================================

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "Data" / "analyzed_transactions.csv"


# ==========================================
# LOAD DATA
# ==========================================

def load_results():

    df = pd.read_csv(DATA_PATH)

    return df


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Bitcoin Fraud Detection API is running",
        "status": "online"
    }


# ==========================================
# SUMMARY
# ==========================================

@app.get("/summary")
def summary():

    df = load_results()

    return {

        "total_transactions":
            int(len(df)),

        "high_risk":
            int(
                (df["risk_level"] == "HIGH").sum()
            ),

        "medium_risk":
            int(
                (df["risk_level"] == "MEDIUM").sum()
            ),

        "low_risk":
            int(
                (df["risk_level"] == "LOW").sum()
            )
    }


# ==========================================
# ALL TRANSACTIONS
# ==========================================

@app.get("/transactions")
def transactions():

    df = load_results()

    # Convert NaN values safely
    df = df.fillna("")

    # Convert dataframe to JSON
    result = df.to_dict(
        orient="records"
    )

    return result


# ==========================================
# SINGLE TRANSACTION
# ==========================================

@app.get("/transaction/{txid}")
def transaction(txid: str):

    df = load_results()

    result = df[
        df["txid"].astype(str) == str(txid)
    ]

    if result.empty:

        return {
            "error": "Transaction not found"
        }

    return result.iloc[0].to_dict()


# ==========================================
# TRANSACTION ACTIVITY
# ==========================================

@app.get("/activity")
def activity():

    df = load_results()

    # Convert timestamp
    df["timestamp"] = pd.to_datetime(
        df["timestamp"]
    )

    # Day name
    df["day"] = df[
        "timestamp"
    ].dt.day_name()

    days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]

    # ======================================
    # TOTAL TRANSACTIONS PER DAY
    # ======================================

    transaction_counts = (
        df.groupby("day")
        .size()
        .reindex(days)
        .fillna(0)
        .astype(int)
    )

    # ======================================
    # HIGH RISK TRANSACTIONS PER DAY
    # ======================================

    high_risk_df = df[
        df["risk_level"] == "HIGH"
    ]

    high_risk_counts = (
        high_risk_df.groupby("day")
        .size()
        .reindex(days)
        .fillna(0)
        .astype(int)
    )

    # ======================================
    # RETURN DATA
    # ======================================

    return {

        "labels": [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
        ],

        "transaction_counts": [
            int(value)
            for value in transaction_counts
        ],

        "high_risk_counts": [
            int(value)
            for value in high_risk_counts
        ]
    }


# ==========================================
# ENTITY ANALYSIS
# ==========================================
#
# Creates blockchain entities from:
#
# input_addresses
# output_addresses
#
# For every wallet/entity we calculate:
#
# - Transaction count
# - Total BTC volume
# - Average risk score
# - Highest risk score
# - High-risk transactions
# - Medium-risk transactions
# - Low-risk transactions
# - Cluster ID
# - Risk level
#
# ==========================================

@app.get("/entities")
def entities():

    df = load_results()

    # ======================================
    # CHECK REQUIRED COLUMNS
    # ======================================

    required_columns = [
        "txid",
        "input_addresses",
        "output_addresses",
        "amount",
        "risk_score",
        "risk_level"
    ]

    for column in required_columns:

        if column not in df.columns:

            return {
                "error":
                    f"Missing column: {column}"
            }

    # ======================================
    # SAFE DATA TYPES
    # ======================================

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    ).fillna(0)

    df["risk_score"] = pd.to_numeric(
        df["risk_score"],
        errors="coerce"
    ).fillna(0)

    # ======================================
    # ENTITY STORAGE
    # ======================================

    entity_data = {}

    # ======================================
    # PROCESS EVERY TRANSACTION
    # ======================================

    for _, row in df.iterrows():

        # ----------------------------------
        # Get wallets from input addresses
        # ----------------------------------

        input_addresses = str(
            row["input_addresses"]
        )

        input_wallets = [
            wallet.strip()
            for wallet in input_addresses.split("|")
            if wallet.strip()
        ]

        # ----------------------------------
        # Get wallets from output addresses
        # ----------------------------------

        output_addresses = str(
            row["output_addresses"]
        )

        output_wallets = [
            wallet.strip()
            for wallet in output_addresses.split("|")
            if wallet.strip()
        ]

        # ----------------------------------
        # Combine wallets
        # ----------------------------------

        wallets = list(
            set(
                input_wallets +
                output_wallets
            )
        )

        # ----------------------------------
        # Transaction information
        # ----------------------------------

        amount = float(
            row["amount"]
        )

        risk_score = float(
            row["risk_score"]
        )

        risk_level = str(
            row["risk_level"]
        )

        cluster = row.get(
            "entity_cluster",
            -1
        )

        # ----------------------------------
        # Add transaction to every wallet
        # ----------------------------------

        for wallet in wallets:

            if wallet not in entity_data:

                entity_data[wallet] = {

                    "entity_id":
                        wallet,

                    "transaction_count":
                        0,

                    "total_btc":
                        0.0,

                    "risk_scores":
                        [],

                    "high_risk_count":
                        0,

                    "medium_risk_count":
                        0,

                    "low_risk_count":
                        0,

                    "clusters":
                        []

                }

            entity = entity_data[
                wallet
            ]

            entity[
                "transaction_count"
            ] += 1

            entity[
                "total_btc"
            ] += amount

            entity[
                "risk_scores"
            ].append(
                risk_score
            )

            # --------------------------------
            # Risk counters
            # --------------------------------

            if risk_level == "HIGH":

                entity[
                    "high_risk_count"
                ] += 1

            elif risk_level == "MEDIUM":

                entity[
                    "medium_risk_count"
                ] += 1

            else:

                entity[
                    "low_risk_count"
                ] += 1

            # --------------------------------
            # Cluster
            # --------------------------------

            try:

                cluster_value = int(
                    float(cluster)
                )

                entity[
                    "clusters"
                ].append(
                    cluster_value
                )

            except:

                pass

    # ======================================
    # BUILD FINAL ENTITY LIST
    # ======================================

    result = []

    for entity in entity_data.values():

        scores = entity[
            "risk_scores"
        ]

        # ----------------------------------
        # Average risk
        # ----------------------------------

        if scores:

            average_risk = (
                sum(scores) /
                len(scores)
            )

            highest_risk = max(
                scores
            )

        else:

            average_risk = 0
            highest_risk = 0

        # ----------------------------------
        # Determine entity risk
        # ----------------------------------

        # Use average risk as the main indicator
        # and highest risk as a supporting signal.

        if average_risk >= 75:

             entity_risk = "HIGH"

        elif average_risk >= 45:

             entity_risk = "MEDIUM"

        else:

              entity_risk = "LOW"

        # ----------------------------------
        # Most common cluster
        # ----------------------------------

        clusters = entity[
            "clusters"
        ]

        if clusters:

            cluster_series = pd.Series(
                clusters
            )

            most_common_cluster = int(
                cluster_series.mode().iloc[0]
            )

        else:

            most_common_cluster = -1

        # ----------------------------------
        # Final entity record
        # ----------------------------------

        result.append({

            "entity_id":
                entity["entity_id"],

            "transaction_count":
                entity[
                    "transaction_count"
                ],

            "total_btc":
                round(
                    entity["total_btc"],
                    4
                ),

            "average_risk":
                round(
                    average_risk,
                    1
                ),

            "highest_risk":
                round(
                    highest_risk,
                    1
                ),

            "high_risk_count":
                entity[
                    "high_risk_count"
                ],

            "medium_risk_count":
                entity[
                    "medium_risk_count"
                ],

            "low_risk_count":
                entity[
                    "low_risk_count"
                ],

            "entity_cluster":
                most_common_cluster,

            "risk_level":
                entity_risk

        })

            # ======================================
    # SORT ENTITIES
    # ======================================

    result.sort(
        key=lambda x: x["entity_id"]
    )

    # ======================================
    # RETURN ALL ENTITIES
    # ======================================

    return result