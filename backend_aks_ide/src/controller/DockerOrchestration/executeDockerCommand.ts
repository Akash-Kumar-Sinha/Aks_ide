import Docker from "dockerode";

const executeDockerCommand = async ({
  container,
  command,
}: {
  container: Docker.Container;
  command: string;
}): Promise<string> => {
  const exec = await container.exec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Cmd: command.split(" "),
  });

  return new Promise((resolve, reject) => {
    exec.start({ hijack: true, stdin: true }, (err, stream) => {
      if (err) {
        console.error("Error in starting exec:", err);
        return reject(err);
      }
      if (!stream) {
        return reject(new Error("Failed to start exec stream"));
      }

      let output = "";

      stream.on("data", (data) => {
        output += data.toString(); // Capture output as string
      });

      stream.on("end", () => resolve(output.trim())); // Resolve with the complete output
      stream.on("error", (err) => reject(err));
    });
  });
};

export default executeDockerCommand;
