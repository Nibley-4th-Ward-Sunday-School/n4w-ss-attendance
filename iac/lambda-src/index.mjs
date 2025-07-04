export const handler = async (event) => {
  console.log("Event: ", JSON.stringify(event, null, 2));

  // Simulate processing the event
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({
      message: "Event processed successfully",
      input: event,
    }),
  };

  return response;
};
