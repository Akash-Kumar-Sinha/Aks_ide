# Welcome to Aks_ide

## Run on localMachine

### Run on local machine for docker_ide branch (docker is not working)

```shell
  docker volume create postgres_data
```

```shell
  docker-compose up
```

### Run on local Machine

1. ```cd Aks_ide```
2. ```npm install```
3. ```npm run dev```
4. ```cd backend_aks_ide```
5. ```npm install```
6. ```npm run dev```

## Basic command to run inside Aks Ide

1. ```apt update```
2. ```apt install -y nano```
3. ```apt install -y curl```
4. ```apt install -y lsof```
5. ```apt install -y iputils-ping```

## Node installation guide inside Aks Ide

[How to Install Nonvm install v18.10.0de.js on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-3-installing-node-using-the-node-version-manager)

1. ```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash```

    - Or ```curl -k -o- http://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash```
    - Or ```curl --insecure -o- http://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash```

2. ```source ~/.bashrc```
3. ```nvm install v18.10.0```
4. Check node is installed or not ```node -v```
    - Output should be: ```v18.10.0```

## Start with React vite

- Run ```npm create vite@latest```
- Run vite project using ```npx vite --host 0.0.0.0 --port 2000```
