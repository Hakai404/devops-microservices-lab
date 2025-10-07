# Use official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app

# Copy csproj and restore dependencies
COPY lakepublisher.csproj ./
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet publish -c Release -o out

# Use runtime image for final stage
FROM mcr.microsoft.com/dotnet/runtime:9.0

WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/out .

# Create data directory
RUN mkdir -p /app/data

# Run the application
ENTRYPOINT ["dotnet", "lakepublisher.dll"]
