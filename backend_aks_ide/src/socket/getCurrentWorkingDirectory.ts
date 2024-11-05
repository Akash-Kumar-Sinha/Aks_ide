import Docker from "dockerode";

const docker = new Docker();

const getCurrentWorkingDirectory = async (containerId: string) => {
  try {
    const container = docker.getContainer(containerId);
    
    const exec = await container.exec({
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ['pwd'],
    });

    const stream = await exec.start({ hijack: true, stdin: true });
    
    return new Promise((resolve, reject) => {
      let output = '';

      stream.on('data', (data) => {
        output += data.toString().trim(); // Collect the output
      });

      stream.on('end', () => {
        console.log('Done fetching the current working directory.');
        resolve(output); // Resolve the promise with the output
      });

      stream.on('error', (error) => {
        reject(error); // Reject the promise if there's an error
      });
    });
  } catch (error) {
    console.error('Error getting current working directory:', error);
    throw error; // Optionally rethrow the error
  }
};

export default getCurrentWorkingDirectory;
