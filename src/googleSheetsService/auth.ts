import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { errorKV, fatalKV, infoKV } from '../logger/logger';

const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getAuthenticatedService() {
  try {
    const credentialsJSON = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const credentials = JSON.parse(credentialsJSON);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    let token;
    try {
      const tokenJSON = await fs.readFile(TOKEN_PATH, 'utf8');
      token = JSON.parse(tokenJSON);
    } catch {
      token = await getNewToken(oAuth2Client);
      await saveToken(token);
    }

    oAuth2Client.setCredentials(token);
    return google.sheets({ version: 'v4', auth: oAuth2Client });
  } catch (err: any) {
    errorKV('Unable to initialize Google Sheets API', { err, fn: 'auth:getAuthenticatedService' });
    throw err;
  }
}

async function getNewToken(oAuth2Client: OAuth2Client): Promise<any> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:\n', authUrl);

  const code = await prompt('Enter the code from that page here: ');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    return tokens;
  } catch (err) {
    fatalKV('Failed to exchange code for token', { err, fn: 'auth:getNewToken' });
    throw err;
  }
}

async function saveToken(token: any): Promise<void> {
  try {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    infoKV('Token stored to', { path: TOKEN_PATH });
  } catch (err) {
    fatalKV('Unable to store token to file', { err, fn: 'auth:saveToken' });
    throw err;
  }
}

function prompt(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}