import fs from "fs";
import { google } from "googleapis";
import { LoggerService } from "../logger-service";
import path from "path";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = "credentials.json";

const logger = new LoggerService("GoogleSheetsService.Authorize");

export async function authorize(): Promise<JWT> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));

  const client = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  await client.authorize();
  logger.log("Authorized using service account.");
  return client;
}