#!/usr/bin/env bash
# Render start step: runs the jar built by render-build.sh with the JDK it downloaded.
set -euo pipefail
cd "$(dirname "$0")"

# Fit the JVM to small instances (Render free/starter have 512 MB). Render provides PORT.
exec ./.jdk/bin/java -XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Dserver.port="${PORT:-8080}" -jar app.jar
