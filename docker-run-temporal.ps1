# PowerShell script to start Temporal server using Docker Compose

Write-Host "Starting Temporal server..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start Temporal server
docker-compose up -d

Write-Host ""
Write-Host "Temporal server is starting..." -ForegroundColor Green
Write-Host "Temporal UI will be available at: http://localhost:8081" -ForegroundColor Yellow
Write-Host "Temporal gRPC endpoint: localhost:7233" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs, run: docker-compose logs -f temporal" -ForegroundColor Gray
Write-Host "To stop, run: docker-compose down" -ForegroundColor Gray
