export const handler = async (event) => {
  const {
    requestContext: {
      http: { method },
    },
    body,
  } = event;
  if (method !== "POST" || !body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid request. Only POST requests with a body are allowed.",
      }),
    };
  }
  let parsedBody;
  try {
    parsedBody = JSON.parse(body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Invalid JSON body.",
      }),
    };
  }
  const name = parsedBody.name?.trim();
  const classroom = parsedBody.classroom?.trim();
  if (!name || !classroom) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing required fields: 'name' and 'classroom'.",
      }),
    };
  }
  if (typeof name !== "string" || typeof classroom !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "'name' and 'classroom' must be strings.",
      }),
    };
  }
  if (name.length > 100 || classroom.length > 20) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          "'name' must not exceed 100 characters and 'classroom' must not exceed 20 characters.",
      }),
    };
  }
  if (!name.includes(" ")) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "'name' must contain at least one space.",
      }),
    };
  }
  const currentIsoDate = new Date().toISOString().slice(0, 10);
  // Simulate processing the event
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      currentIsoDate,
      name,
      classroom,
    }),
  };

  return response;
};
