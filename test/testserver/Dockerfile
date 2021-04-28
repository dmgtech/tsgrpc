FROM mcr.microsoft.com/dotnet/sdk:5.0 as build
WORKDIR /src
COPY testserver.csproj /src
RUN dotnet restore
COPY . /src
RUN dotnet publish -c Release

FROM mcr.microsoft.com/dotnet/runtime:5.0 as runtime
WORKDIR /app
COPY --from=build /src/bin/Release/net5.0/publish .
env PORT=50051 host=localhost
ENTRYPOINT ["/app/testserver"]

