@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements. See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership. The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License. You may obtain a copy of the License at
@REM
@REM https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied. See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM Apache Maven Wrapper startup batch script, version 3.3.2

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0") ELSE SET "BASE_DIR=%__MVNW_ARG0_NAME__%"

@SET MAVEN_PROJECTBASEDIR=%BASE_DIR%
IF NOT "%MAVEN_BASEDIR%"=="" SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%

@SET EXEC_DIR=%CD%
@SET WDIR=%EXEC_DIR%

@SET MAVEN_WRAPPER_PROPERTIES_PATH=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties
@SET MAVEN_WRAPPER_JAR_PATH=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar

@IF NOT EXIST "%MAVEN_WRAPPER_PROPERTIES_PATH%" (
    @ECHO Could not find .mvn\wrapper\maven-wrapper.properties
    GOTO error
)

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_WRAPPER_PROPERTIES_PATH%") DO (
    @IF "%%A"=="distributionUrl" SET DISTRIBUTION_URL=%%B
    @IF "%%A"=="distributionSha256Sum" SET DISTRIBUTION_SHA256_SUM=%%B
)

@SET MAVEN_USER_HOME=%USERPROFILE%\.m2
@IF NOT "%MAVEN_USER_HOME%"=="" SET MAVEN_USER_HOME=%MAVEN_USER_HOME%

@FOR /F "tokens=*" %%i IN ('echo %DISTRIBUTION_URL%') DO SET DISTRIBUTION_URL=%%i
@SET DISTRIBUTION_URL=%DISTRIBUTION_URL: =%

@FOR %%F IN ("%DISTRIBUTION_URL%") DO SET DISTRIBUTION_FILENAME=%%~nxF
@SET MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\%DISTRIBUTION_FILENAME:~0,-4%

@IF EXIST "%MAVEN_HOME%\apache-maven*\bin\mvn.cmd" (
    @FOR /D %%D IN ("%MAVEN_HOME%\apache-maven*") DO SET MAVEN_HOME=%%D
    GOTO runMaven
)

@ECHO Downloading Maven from %DISTRIBUTION_URL%
@ECHO Storing to %MAVEN_HOME%

@IF NOT EXIST "%MAVEN_HOME%" MKDIR "%MAVEN_HOME%"

@SET DOWNLOAD_SCRIPT=%TEMP%\download-maven.ps1
@ECHO [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 > "%DOWNLOAD_SCRIPT%"
@ECHO $url = "%DISTRIBUTION_URL%" >> "%DOWNLOAD_SCRIPT%"
@ECHO $dest = "%MAVEN_HOME%\%DISTRIBUTION_FILENAME%" >> "%DOWNLOAD_SCRIPT%"
@ECHO Invoke-WebRequest -Uri $url -OutFile $dest >> "%DOWNLOAD_SCRIPT%"
@ECHO Expand-Archive -Path $dest -DestinationPath "%MAVEN_HOME%" -Force >> "%DOWNLOAD_SCRIPT%"
@ECHO Remove-Item $dest >> "%DOWNLOAD_SCRIPT%"

@powershell -ExecutionPolicy Bypass -File "%DOWNLOAD_SCRIPT%"
@IF ERRORLEVEL 1 GOTO error

@FOR /D %%D IN ("%MAVEN_HOME%\apache-maven*") DO SET MAVEN_HOME=%%D

:runMaven
@SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
@IF NOT EXIST "%JAVA_EXE%" SET JAVA_EXE=java

@SET MAVEN_CMD_LINE_ARGS=%*
"%MAVEN_HOME%\bin\mvn.cmd" %MAVEN_CMD_LINE_ARGS%
@SET ERROR_CODE=%ERRORLEVEL%

GOTO end

:error
SET ERROR_CODE=1

:end
@ENDLOCAL
EXIT /B %ERROR_CODE%
