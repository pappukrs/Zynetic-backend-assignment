#!/bin/bash


BASE_URL="http://localhost:3000/v1"
NUM_DEVICES=5
NUM_READINGS=10

echo " Energy Ingestion Engine - Test Data Generator"
echo "================================================"
echo "Base URL: $BASE_URL"
echo "Devices: $NUM_DEVICES"
echo "Readings per device: $NUM_READINGS"
echo ""

random_float() {
    echo "scale=4; $1 + ($RANDOM % 10000) / 10000" | bc
}

get_timestamp() {
    date -u -d "$1 minutes ago" +%Y-%m-%dT%H:%M:%SZ
}

echo " Generating historical data..."

for device in $(seq 1 $NUM_DEVICES); do
    DEVICE_ID=$(printf "VEH-%03d" $device)
    METER_ID=$(printf "METER-%03d" $device)

    echo "Processing device $device: $DEVICE_ID / $METER_ID"

    for minute in $(seq 0 $NUM_READINGS); do
        TIMESTAMP=$(get_timestamp $minute)

        BASE_DC=$(echo "scale=4; 95 + ($RANDOM % 500) / 100" | bc)
        BASE_AC=$(echo "scale=4; $BASE_DC / 0.87" | bc)
        SOC=$(echo "scale=2; 20 + ($RANDOM % 7000) / 100" | bc)
        VOLTAGE=$(echo "scale=2; 235 + ($RANDOM % 1000) / 100" | bc)
        TEMP=$(echo "scale=2; 25 + ($RANDOM % 1500) / 100" | bc)

        curl -s -X POST "$BASE_URL/ingest/meter" \
            -H "Content-Type: application/json" \
            -d "{
                \"meterId\": \"$METER_ID\",
                \"kwhConsumedAc\": $BASE_AC,
                \"voltage\": $VOLTAGE,
                \"timestamp\": \"$TIMESTAMP\"
            }" > /dev/null

        curl -s -X POST "$BASE_URL/ingest/vehicle" \
            -H "Content-Type: application/json" \
            -d "{
                \"vehicleId\": \"$DEVICE_ID\",
                \"soc\": $SOC,
                \"kwhDeliveredDc\": $BASE_DC,
                \"batteryTemp\": $TEMP,
                \"timestamp\": \"$TIMESTAMP\"
            }" > /dev/null

        echo -n "."
    done
    echo " "
done

echo ""
echo " Data generation complete!"
echo ""
echo " Testing API Endpoints..."
echo ""

echo "1. Analytics for VEH-001 (24 hours):"
curl -s "$BASE_URL/analytics/performance/VEH-001?hours=24" | json_pp
echo ""

echo "2. Vehicle Status for VEH-001:"
curl -s "$BASE_URL/status/vehicle/VEH-001" | json_pp
echo ""

echo "3. Meter Status for METER-001:"
curl -s "$BASE_URL/status/meter/METER-001" | json_pp
echo ""

echo "4. Fleet Inefficiency Check:"
curl -s "$BASE_URL/analytics/fleet/inefficient?threshold=0.85&hours=24" | json_pp
echo ""

echo " All tests complete!"
echo ""
echo " Try different queries:"
echo "   - curl \"$BASE_URL/analytics/performance/VEH-002?hours=1\""
echo "   - curl \"$BASE_URL/status/vehicle/VEH-003\""
echo "   - curl \"$BASE_URL/analytics/fleet/inefficient?threshold=0.90\""