import Docker from "dockerode";

const docker = new Docker();

const getCurrentWorkingDirectory = async (containerId: string) => {
  try {
    const container = docker.getContainer(containerId);

    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["pwd"],
    });

    const stream = await exec.start({ hijack: true, stdin: true });

    return new Promise((resolve, reject) => {
      let output = "";

      stream.on("data", (data) => {
        output += data.toString().trim();
      });

      stream.on("end", () => {
        console.log("Done fetching the current working directory.");
        resolve(output);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error getting current working directory:", error);
    throw error;
  }
};

export default getCurrentWorkingDirectory;
