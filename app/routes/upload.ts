import { json, ActionArgs, ActionFunction } from "@remix-run/node";


export const action: ActionFunction = async ({ request }: ActionArgs) => {

  if (!request.body) {
    return new Response("No file uploaded.", { status: 400 });
  }

  try {
    const reader = request.body.getReader();

    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Process the chunk
      console.log("Received chunk", value);

      receivedLength += value.length;
    }

    console.log("Received file size:", receivedLength);

    return json({ message: "File uploaded successfully." });
  } catch (error) {
    return new Response("An error occurred while uploading the file.", {
      status: 500,
    });
  }
}
