const useInstallationGuide = () => {
  const installationCommands = [
    {
      title: "Basic Commands to Run Inside Aks IDE",
      description:
        "These commands install essential utilities and prepare the environment for further setup.",
      commands: [
        "apt update",
        "apt install -y nano",
        "apt install -y curl",
        "apt install -y lsof",
        "apt install -y iputils-ping",
      ],
      keywords: ["apt", "nano", "curl", "lsof", "iputils-ping", "ping"],
    },
    {
      title: "Node.js Installation Guide",
      description:
        "Install Node.js using NVM (Node Version Manager) for flexible version management. You can use one of the following curl commands to install NVM. The first one is recommended: curl -o-",
      commands: [
        "apt update",
        "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
        "curl -k -o- http://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
        "curl --insecure -o- http://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
        "source ~/.bashrc",
        "nvm install v18.10.0",
        "node -v",
      ],
      keywords: [
        "node",
        "nvm",
        "npm",
        "javascript",
        "nodejs",
        "typescript",
        "js",
      ],
    },
    {
      title: "Vite Installation Guide",
      description:
        "Set up Vite, a fast and optimized development environment for modern JavaScript frameworks.",
      commands: [
        "npm create vite@latest",
        "npx vite --host 0.0.0.0 --port 2000",
      ],
      keywords: ["node", "React", "vite"],
    },
    {
      title: "TypeScript Installation Guide",
      description:
        "Install TypeScript globally and verify its version for TypeScript development.",
      commands: ["npm install -g typescript", "tsc --version"],
      keywords: ["node", "typescript", "ts-node", "ts"],
    },
    {
      title: "Git Installation Guide",
      description:
        "Install Git, a version control system, and verify its version.",
      commands: ["apt update", "apt install -y git", "git --version"],
      keywords: ["git", "version control", "github"],
    },
  ];

  return { installationCommands };
};

export default useInstallationGuide;
