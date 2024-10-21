#!/bin/bash

# Check instance name parameter
if [ $# -eq 0 ]; then
    echo "Usage: $0 <instance-name>"
    exit 1
fi

# Store the instance name parameter
INSTANCE_NAME="$1"

# Retrieve instances data with filtering on tag Name
INSTANCE_INFO=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=*${INSTANCE_NAME}*" "Name=instance-state-name,Values=running" \
    --query 'Reservations[].Instances[].[Tags[?Key==`Name`].Value | [0], PrivateIpAddress]' \
    --output text)

# Exist if no result
if [ -z "$INSTANCE_INFO" ]; then
    echo "No running instances found with a name containing: $INSTANCE_NAME"
    exit 1
fi

# Finding the best match and retrieving private IP
BEST_MATCH=$(echo "$INSTANCE_INFO" | grep -i "$INSTANCE_NAME" | head -n 1)
INSTANCE_NAME=$(echo "$BEST_MATCH" | cut -f1)
PRIVATE_IP=$(echo "$BEST_MATCH" | cut -f2)

# Exit if no result
if [ -z "$PRIVATE_IP" ]; then
    echo "No running instance found with a name containing: $INSTANCE_NAME"
    exit 1
fi

# Connecting!
echo "Connecting to instance $INSTANCE_NAME at $PRIVATE_IP..."
ssh $PRIVATE_IP