# CZIDLO Frontend

This repository contains the frontend application for **CZIDLO**, a system for assigning, managing, and resolving URN:NBN identifiers.

The frontend provides the administrative web UI for the CZIDLO platform. It is used mainly for user and permission management, search, statistics, manual data entry, and editing.

For the main backend repository and the overall technical documentation, see:

- Main repository: [NLCR/CZIDLO](https://github.com/NLCR/CZIDLO)
- Technical documentation: [CZIDLO documentation in the main repository](https://github.com/NLCR/CZIDLO)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development

### Prepare

```shell
# Preferably use nvm to select the proper Node.js (and npm) version from .nvmrc.
# Alternatively, use another supported npm version (see package.json engines).
nvm use

# Install dependencies exactly as locked in package-lock.json.
npm ci

# Alternatively, install dependencies with npm install.
# Use this mainly if you are missing dependencies locally.
npm install
```

### Run

Run:

```shell
npm run start
```

Then open:

```text
http://localhost:4200/
```

The application will automatically reload when source files are changed.

## Build and Run

### Build

First define the configuration in environment variables:

```shell
export APP_DEV_MODE=false
export APP_CZIDLO_API_SERVICE_URL="https://resolver-dev.nkp.cz/web-api/api"
export APP_CZIDLO_PUBLIC_API_URL="https://resolver-dev.nkp.cz/api/v6"
```

Then build the project:

```shell
npm run build
```

The build artifacts will be stored in the `dist/` directory.

The configuration from the `APP_*` variables will be written to:

```text
dist/czidlo-frontend/browser/assets/env.json
```

### Run the built application

To test the built application locally:

```shell
npx serve dist/czidlo-frontend/browser -l 8181
```

Then open:

```text
http://localhost:8181
```

## Docker Build and Run

### Build

Build a local image:

```shell
docker build -t czidlo-frontend .
```

Optionally, build with your own repository and version tag:

```shell
docker build -t yourorg/czidlo-frontend:6.0 .
```

Or build with both a version tag and `latest`:

```shell
docker build -t yourorg/czidlo-frontend:latest -t yourorg/czidlo-frontend:6.0 .
```

### Push to Docker Hub

Only if you want to publish the image to your own Docker Hub repository.

You do not need this step to run a locally built Docker image.

```shell
docker push yourorg/czidlo-frontend:6.0
docker push yourorg/czidlo-frontend:latest
```

### Run Docker image

#### Local image

Run a locally built Docker image:

```shell
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://resolver-dev.nkp.cz/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver-dev.nkp.cz/api/v6 \
  czidlo-frontend
```

#### Run exact version

```shell
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://resolver-dev.nkp.cz/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver-dev.nkp.cz/api/v6 \
  yourorg/czidlo-frontend:latest
```

or

```shell
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://resolver-dev.nkp.cz/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver-dev.nkp.cz/api/v6 \
  yourorg/czidlo-frontend:6.0
```

#### Image pulled from Docker Hub

Run an image that was built and pushed to Docker Hub:

```shell
docker pull yourorg/czidlo-frontend:latest
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://resolver-dev.nkp.cz/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver-dev.nkp.cz/api/v6 \
  yourorg/czidlo-frontend:latest
```

Then open:

```text
http://localhost:1234
```

## Additional resources

For more information about Angular CLI, including detailed command references, see the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
