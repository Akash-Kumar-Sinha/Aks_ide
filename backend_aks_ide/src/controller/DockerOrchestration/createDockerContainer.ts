import Docker from "dockerode";
// import executeDockerCommand from "./executeDockerCommand";

const docker = new Docker();

const createDockerContainer = async () => {
  const imageName = "ubuntu:20.04";

  try {
    const images = await docker.listImages();
    const imageExists = images.some((image) =>
      image.RepoTags?.includes(imageName)
    );

    if (!imageExists) {
      console.log(`Pulling image ${imageName}...`);
      await new Promise<void>((resolve, reject) => {
        docker.pull(
          imageName,
          (err: unknown, stream: NodeJS.ReadableStream) => {
            if (err) {
              return reject(err);
            }
            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err: unknown) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }

            function onProgress(event: { status: string }) {
              console.log(event.status);
            }
          }
        );
      });
      console.log(`Image ${imageName} successfully pulled.`);
    }

    const container = await docker.createContainer({
      Image: imageName,
      Cmd: ["/bin/bash"],
      Tty: true,
    });

    await container.start();
    
    return container.id;
  } catch (error) {
    console.error("Error creating Docker container:", error);
    throw error;
  }
};

export default createDockerContainer;
