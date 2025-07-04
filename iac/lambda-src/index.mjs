import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const dynamodbTableName = process.env.DYNAMODB_TABLE_NAME;
const secondsInYear = 60 * 60 * 24 * 365;
const permittedRooms = new Set([
  "Gospel Doctrine",
  "Sunday School 11-12",
  "Sunday School 13-14",
  "Sunday School 15-17",
]);

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

  if (!permittedRooms.has(classroom)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid classroom. Permitted classrooms are: ${Array.from(
          permittedRooms
        ).join(", ")}.`,
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
  const now = new Date();
  const isSunday = now.getDay() === 0; // 0 is Sunday in JavaScript
  const epochSeconds = Math.floor(now.getTime() / 1000);
  const expirationTime = isSunday
    ? epochSeconds + secondsInYear // 1 year expiration
    : epochSeconds + 300; // 5 minutes expiration if not Sunday
  const currentIsoDate = now.toISOString().slice(0, 10);
  const command = new PutCommand({
    TableName: dynamodbTableName,
    Item: {
      UserName: name,
      RoomId: classroom,
      DateDay: currentIsoDate,
      ExpirationTime: expirationTime,
    },
  });

  try {
    await docClient.send(command);
  } catch (error) {
    console.error("Error saving to DynamoDB:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error while saving data.",
      }),
    };
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Attendance recorded successfully.",
      data: {
        name,
        classroom,
        date: currentIsoDate,
      },
    }),
  };

  return response;
};
