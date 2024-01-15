docker-compose down
DOCKER_BUILDKIT=1 docker-compose --profile server up -d --build
docker rmi $(docker images -f "dangling=true" -q) 2> /dev/null