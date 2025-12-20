# CzidloFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.6.

## Development

### Prepare
```shell
#preferably use nvm to select proper version of node (and npm) from .nvmrc 
#alternatively use another supported version of npm (see package.json engines)
nvm use
#use "npm clean install" or npm ci to update all dependences
npm ci
#or install libraries with "nvm install" (only if you're missing some dependencies)
npm install
```

### Run

`npm run start`

for a local dev server. Navigate to `http://localhost:4200/`.
The application will automatically reload if you change any of the source files.

## Build & Run

### Build

First define configuration in environment variables

```shell
export APP_DEV_MODE=false
export APP_CZIDLO_API_SERVICE_URL="https://czidlo-web-api.trinera.cloud/web-api/api"
export APP_CZIDLO_PUBLIC_API_URL="https://resolver.nkp.cz/api/v6"
```

Now run `npm run build` to build the project. 

The build artifacts will be stored in the `dist/` directory.

The environment configuration from `APP_*` variables will be stored into `dist/czidlo-frontend/browser/assets/env.json`

### Run

To test the the app you've just built 

`npx serve dist/czidlo-frontend/browser -l 8181` 

And open in browser

`http://localhost:8181`

## Docker Build & Run

### Build
```
docker build -t czidlo-frontend .
```

possibly including version tag  
```
docker build -t trinera/czidlo-frontend:6.0 .
```

or including version tag and tag `latest`
```
docker build -t trinera/czidlo-frontend:latest -t trinera/czidlo-frontend:6.0 .
```

### Push to Dockerhub

Only if you have write access to Dockerhub repository trinera/czidlo-frontend.
You don't need this to run localy built Docker image.

```
docker push trinera/czidlo-frontend:6.0
docker push trinera/czidlo-frontend:latest
```

### Run Docker image

#### Local image

Run locally built Docker image

##### Run
```
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://czidlo-web-api.trinera.cloud/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver.nkp.cz/api/v6 \
trinera/czidlo-frontend
```

##### Run exact version:
```
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://czidlo-web-api.trinera.cloud/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver.nkp.cz/api/v6 \
trinera/czidlo-frontend:latest
```
or

```
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://czidlo-web-api.trinera.cloud/web-api/api \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver.nkp.cz/api/v6 \  
trinera/czidlo-frontend:6.0
```

#### Image pulled from Docker Hub

Run image that someone built and pushed to Dockerhub.

##### Run

```
docker pull trinera/czidlo-frontend:latest
docker run -p 1234:80 \
  -e APP_DEV_MODE=false \
  -e APP_CZIDLO_API_SERVICE_URL=https://czidlo-web-api.trinera.cloud/web-api/api/ \
  -e APP_CZIDLO_PUBLIC_API_URL=https://resolver.nkp.cz/api/v6 \  
trinera/czidlo-frontend
```

And open in browser

`http://localhost:1234`

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
