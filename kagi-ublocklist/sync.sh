#!/bin/bash

# Replace with your actual Kagi API token
# https://kagi.com/settings?p=user_details -> Session Link -> https://kagi.com/search?token=KAGI_TOKEN
KAGI_TOKEN="REPLACE_ME"

# Variables
domains=()
payload=""

retrieve_domains() {
  echo "Retrieving domains from repo..."
  curl -s https://raw.githubusercontent.com/popcar2/BadWebsiteBlocklist/refs/heads/main/uBlacklist.txt |
    grep '^\*://\*\.' |
    sed 's/^\*:\/\/\*\.\([^\/]*\)\/.*$/\1/' |
    sort -u >temp_domains.txt

  while IFS= read -r line; do
    domains+=("$line")
  done <temp_domains.txt

  echo "[${#domains[@]}] unique domains retrieved."

  rm temp_domains.txt
}

prepare_payload() {
  echo "Preparing payload..."

  # Convert array to comma-separated string
  domain_list=$(
    IFS=,
    echo "${domains[*]}"
  )
  encoded_domain_list=${domain_list//,/%2C}
  payload="redirect=%2Fsettings%3Fp%3Duser_ranked&domain_list=${encoded_domain_list}&k=-2"
  echo "Payload prepared : [$payload]"
}

send_request() {
  echo "Sending request..."
  # Send the POST request
  curl -X POST "https://kagi.com/esr/user_rules/bulk" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "X-Kagi-Authorization: ${KAGI_TOKEN}" \
    -H "Origin: https://kagi.com" \
    -H "Referer: https://kagi.com/settings?p=add_ranked" \
    -d "${payload}"
}

echo "Starting process..."

retrieve_domains

prepare_payload

send_request

echo "Done."
