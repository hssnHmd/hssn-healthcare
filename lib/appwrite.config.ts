import * as sdk from 'node-appwrite';

export const {
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COOLECTION_ID,
  DOCTOR_COOLECTION_ID,
  APPOINTMENT_COOLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCEKT_ID,
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
} = process.env;

const client = new sdk.Client();

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export const database = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export const messaging = new sdk.Messaging(client);
export const users = new sdk.Users(client);
