docker stop token-registry-api-container         # Stop the existing container
docker rm token-registry-api-container           # Remove the stopped container
docker build -t token-registry-api .             # Build the latest image
docker run -p 8080:8080 -d --name token-registry-api-container --env-file .env token-registry-api  # Start a new container
docker logs -f token-registry-api-container