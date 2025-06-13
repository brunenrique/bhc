"use client";

import { google, calendar_v3 } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

interface StoredToken {
  access_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
}

/**
 * Key used to store Google OAuth tokens in localStorage.
 */
function tokenKey(userId: string): string {
  return `gcal_token_${userId}`;
}

/**
 * Creates an OAuth2 client configured with environment variables.
 */
function createClient() {
  return new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
  );
}

/**
 * Returns an OAuth client with stored credentials loaded if available.
 */
export function getOAuthClient(userId: string) {
  const client = createClient();
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(tokenKey(userId));
    if (stored) {
      client.setCredentials(JSON.parse(stored) as StoredToken);
    }
  }
  return client;
}

/**
 * Checks if tokens for the user exist in localStorage.
 */
export function hasTokens(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(tokenKey(userId));
}

/**
 * Removes stored tokens for a given user.
 */
export function clearTokens(userId: string) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(tokenKey(userId));
  }
}

/**
 * Generates the Google OAuth consent URL.
 */
export function getAuthUrl(userId: string): string {
  const client = getOAuthClient(userId);
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

/**
 * Exchanges an authorization code for access tokens.
 */
export async function exchangeCodeForTokens(userId: string, code: string) {
  const client = getOAuthClient(userId);
  const { tokens } = await client.getToken(code);
  setTokens(userId, tokens as StoredToken);
  return tokens;
}

/**
 * Persists OAuth tokens locally and sets them on the client.
 */
export function setTokens(userId: string, tokens: StoredToken) {
  const client = getOAuthClient(userId);
  client.setCredentials(tokens);
  if (typeof window !== 'undefined') {
    localStorage.setItem(tokenKey(userId), JSON.stringify(tokens));
  }
}

/**
 * Inserts a new calendar event or updates an existing one.
 */
export async function insertOrUpdateEvent(userId: string, event: calendar_v3.Schema$Event) {
  const auth = getOAuthClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  if (event.id) {
    const res = await calendar.events.update({
      calendarId: 'primary',
      eventId: event.id,
      requestBody: event,
    });
    return res.data;
  }
  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  return res.data;
}

/**
 * Returns upcoming events from the user's primary calendar.
 */
export async function listUpcomingEvents(userId: string, maxResults = 10) {
  const auth = getOAuthClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });
  return res.data.items || [];
}
