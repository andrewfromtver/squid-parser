import json
from time import sleep


keys = [
    "timestamp",
    "response_time",
    "client_address",
    "result_and_status",
    "transfer_size",
    "request_method",
    "URI",
    "client_identity",
    "peering_code_peerhost",
    "content_type",
]

result = []
with open("/usr/src/squid-parser-agent/log/access.log", "r") as file:
    for line in file.readlines():
        result.append(
            {
                key: int(value) if value.isdigit() else value
                for key, value in zip(keys, line.split())
            }
        )

with open("/usr/src/squid-parser-agent/json/squid.json", "w") as f:
    f.write(json.dumps(result))

sleep(10)
