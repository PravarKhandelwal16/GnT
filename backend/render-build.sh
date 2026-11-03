#!/usr/bin/env bash
# Render build step for the backend, without Docker.
# Render has no Java runtime, so this downloads a pinned JDK 21 and Maven into the project
# folder (both are kept for the start step), then builds the app into app.jar.
set -euo pipefail

JDK_URL="https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.5%2B11/OpenJDK21U-jdk_x64_linux_hotspot_21.0.5_11.tar.gz"
MAVEN_URL="https://archive.apache.org/dist/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz"

cd "$(dirname "$0")"

if [ ! -x .jdk/bin/java ]; then
  echo "Downloading JDK 21"
  rm -rf .jdk && mkdir -p .jdk
  curl -fsSL "$JDK_URL" | tar -xz -C .jdk --strip-components=1
fi

if [ ! -x .maven/bin/mvn ]; then
  echo "Downloading Maven 3.9.9"
  rm -rf .maven && mkdir -p .maven
  curl -fsSL "$MAVEN_URL" | tar -xz -C .maven --strip-components=1
fi

export JAVA_HOME="$PWD/.jdk"
export PATH="$JAVA_HOME/bin:$PATH"
java -version

# Keep the dependency cache inside the project so later builds can reuse it.
./.maven/bin/mvn -B -q -Dmaven.repo.local="$PWD/.m2" clean package -DskipTests
cp target/backend-0.0.1-SNAPSHOT.jar app.jar
echo "Built app.jar"
