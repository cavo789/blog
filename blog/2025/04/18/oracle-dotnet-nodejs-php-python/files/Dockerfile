# cspell:ignore libaio1,instantclient,libclntsh,libocci,ldconfig

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

COPY OracleConnector/*.csproj ./OracleConnector/
RUN dotnet restore ./OracleConnector/OracleConnector.csproj

COPY OracleConnector/. ./OracleConnector/
RUN dotnet publish ./OracleConnector/OracleConnector.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/runtime:8.0 AS final

WORKDIR /app

COPY --from=build /app/out .

# Install necessary Oracle Instant Client libraries
ARG ORACLE_INSTANT_CLIENT_VERSION=21.12
ARG ORACLE_DOWNLOAD_URL=https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linuxx64.zip

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    unzip \
    libaio1 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSL "${ORACLE_DOWNLOAD_URL}" -o instantclient.zip \
    && mkdir -p /usr/lib/oracle/instantclient \
    && unzip -qq instantclient.zip -d /usr/lib/oracle/instantclient \
    && rm instantclient.zip \
    && ln -s /usr/lib/oracle/instantclient/libclntsh.so.${ORACLE_INSTANT_CLIENT_VERSION}.1 /usr/lib/oracle/instantclient/libclntsh.so \
    && ln -s /usr/lib/oracle/instantclient/libocci.so.${ORACLE_INSTANT_CLIENT_VERSION}.1 /usr/lib/oracle/instantclient/libocci.so \
    && echo "/usr/lib/oracle/instantclient" > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig

ENTRYPOINT ["dotnet", "OracleConnector.dll"]
