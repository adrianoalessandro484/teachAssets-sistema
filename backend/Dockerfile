FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY Innovatech.API/Innovatech.API.csproj Innovatech.API/
COPY Innovatech.Application/Innovatech.Application.csproj Innovatech.Application/
COPY Innovatech.Domain/Innovatech.Domain.csproj Innovatech.Domain/
COPY Innovatech.Infrastructure/Innovatech.Infrastructure.csproj Innovatech.Infrastructure/
RUN dotnet restore Innovatech.API/Innovatech.API.csproj

COPY . .
RUN dotnet publish Innovatech.API/Innovatech.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Innovatech.API.dll"]
