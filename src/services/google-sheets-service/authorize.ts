import fs from "fs";
import { google } from "googleapis";
import readline from "readline";
import { LoggerService } from "../logger-service";
import { OAuth2Client } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "credentials.json";

const logger = new LoggerService("GoogleSheetsService.Authorize");

export async function authorize(): Promise<OAuth2Client> {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  logger.log("Authorize this app by visiting this URL:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string) =>
    new Promise<string>((resolve) => rl.question(query, resolve));

  const code = await question("Enter the code from that page here: ");
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  logger.log("Token stored to", TOKEN_PATH);
  return oAuth2Client;
}