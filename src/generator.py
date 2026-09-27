import csv
import random
import uuid
from datetime import datetime, timedelta


random.seed(42)


COUNTRIES = [
    "IN",
    "US",
    "GB",
    "DE",
    "SG",
    "RU"
]


ASNS = [
    "AS15169",
    "AS16509",
    "AS8075",
    "AS13335",
    "AS4134"
]


def random_ip():

    return ".".join(
        str(random.randint(1, 254))
        for _ in range(4)
    )


def random_wallet():

    return "bc1" + uuid.uuid4().hex[:30]


def normal_transaction(timestamp):

    input_count = random.randint(1, 3)
    output_count = random.randint(1, 3)

    inputs = [
        random_wallet()
        for _ in range(input_count)
    ]

    outputs = [
        random_wallet()
        for _ in range(output_count)
    ]

    input_amounts = [
        round(random.uniform(0.01, 0.5), 5)
        for _ in range(input_count)
    ]

    total_input = sum(input_amounts)

    # Leave approximately 1% as fee
    available = total_input * 0.99

    output_amounts = []

    for i in range(output_count - 1):

        amount = round(
            available * random.uniform(0.2, 0.5),
            5
        )

        amount = min(amount, available)

        output_amounts.append(amount)

        available -= amount

    output_amounts.append(
        round(max(available, 0.001), 5)
    )

    return {
        "timestamp": timestamp.isoformat(),
        "src_ip": random_ip(),
        "dst_ip": random_ip(),
        "src_port": random.randint(1024, 65535),
        "dst_port": 8333,
        "txid": uuid.uuid4().hex,
        "input_addresses": "|".join(inputs),
        "output_addresses": "|".join(outputs),
        "input_amounts": "|".join(
            map(str, input_amounts)
        ),
        "output_amounts": "|".join(
            map(str, output_amounts)
        ),
        "geo_country": random.choice(COUNTRIES),
        "asn": random.choice(ASNS),
        "label": "normal"
    }


def suspicious_transaction(timestamp):

    input_count = random.randint(1, 2)

    # Suspicious fan-out pattern
    output_count = random.randint(5, 10)

    inputs = [
        random_wallet()
        for _ in range(input_count)
    ]

    outputs = [
        random_wallet()
        for _ in range(output_count)
    ]

    input_amounts = [
        round(random.uniform(2, 10), 5)
        for _ in range(input_count)
    ]

    total_input = sum(input_amounts)

    amount_each = round(
        (total_input * 0.98) / output_count,
        5
    )

    output_amounts = [
        amount_each
        for _ in range(output_count)
    ]

    return {
        "timestamp": timestamp.isoformat(),
        "src_ip": random_ip(),
        "dst_ip": random_ip(),
        "src_port": random.randint(1024, 65535),
        "dst_port": 8333,
        "txid": uuid.uuid4().hex,
        "input_addresses": "|".join(inputs),
        "output_addresses": "|".join(outputs),
        "input_amounts": "|".join(
            map(str, input_amounts)
        ),
        "output_amounts": "|".join(
            map(str, output_amounts)
        ),
        "geo_country": random.choice(
            ["RU", "SG", "US"]
        ),
        "asn": random.choice(ASNS),
        "label": "suspicious"
    }


def generate_dataset(
    filename="data/synthetic_transactions.csv",
    count=5000
):

    start_time = datetime.now()

    rows = []

    # Spread all transactions across 7 days
    total_seconds = 7 * 24 * 60 * 60

    for i in range(count):

        # Calculate timestamp across the 7-day period
        timestamp = (
            start_time
            + timedelta(
                seconds=(i / (count - 1)) * total_seconds
            )
        )

        # Approximately 15% suspicious
        if random.random() < 0.15:

            row = suspicious_transaction(
                timestamp
            )

        else:

            row = normal_transaction(
                timestamp
            )

        rows.append(row)

    with open(
        filename,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=rows[0].keys()
        )

        writer.writeheader()
        writer.writerows(rows)

    print("Dataset generated successfully!")
    print("Rows:", count)
    print("File:", filename)


if __name__ == "__main__":

    generate_dataset()