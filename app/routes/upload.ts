import { json, ActionArgs, ActionFunction } from "@remix-run/node";

import ffmpeg from "fluent-ffmpeg";
import { Readable } from "stream";
import { requireUser } from "~/session.server";

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  console.log('verify that user is here', user);

  if (!request.body) {
    return new Response("No file uploaded.", { status: 400 });
  }

  try {
    const reader = request.body.getReader();

    const inputStream = new Readable({
      async read() {
        const { done, value } = await reader.read();

        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      },
    });

    // Set up ffmpeg to process the input stream
    const processing = new Promise((resolve, reject) => {
      ffmpeg(inputStream)
        .format("mp3")
        .audioBitrate("128k")
        .on("error", (err: Error) => {
          console.error("An error occurred while processing the file:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("File processed successfully.");
          resolve(null);
        })
        .save(process.cwd() + "/output.mp3");
    });

    await processing;

    return json({ message: "File uploaded and processed successfully." });
  } catch (error) {
    return new Response("An error occurred while uploading and processing the file.", {
      status: 500,
    });
  }
};
