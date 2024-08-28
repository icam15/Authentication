import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2({
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  clientId: process.env.GOOGLE_CLIENT_ID!,
  redirectUri: "http://localhost:8080/api/auth/google/redirect",
});

const scopes = ["profile", "email"];

export const oauthUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});
