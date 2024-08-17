'use server';

import { ID, Query } from 'node-appwrite';
import {
  APPOINTMENT_COOLECTION_ID,
  database,
  DATABASE_ID,
  messaging,
} from '../appwrite.config';
import { formatDateTime, parseStringify } from '../utils';
import { Appointment } from '@/types/appwrite.types';
import { revalidatePath } from 'next/cache';

export const createAppointment = async (
  appointmentData: CreateAppointmentParams
) => {
  try {
    const newPatient = await database.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COOLECTION_ID!,
      ID.unique(),
      appointmentData
    );
    return parseStringify(newPatient);
  } catch (error) {
    console.log(error);
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await database.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COOLECTION_ID!,
      appointmentId
    );
    return parseStringify(appointment);
  } catch (error) {
    console.log(error);
  }
};

export const getRecentAppointments = async () => {
  try {
    const appointments = await database.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COOLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    );

    const initialCount = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case 'scheduled':
            acc.scheduledCount++;
            break;
          case 'pending':
            acc.pendingCount++;
            break;
          case 'cancelled':
            acc.cancelledCount++;
            break;
        }

        return acc;
      },
      initialCount
    );
    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };
    return parseStringify(data);
  } catch (error) {
    console.log(
      'An error occurred while retrieving the recent appointments:',
      error
    );
  }
};

export const updateAppointment = async ({
  userId,
  appointmentId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await database.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COOLECTION_ID!,
      appointmentId,
      appointment
    );
    if (!updatedAppointment) {
      throw new Error('Appointment not found');
    }
    const smsMessage = `
      Hi, it's Carpulse
      ${
        type === 'schedule'
          ? `Your appointment has been scheduled for ${
              formatDateTime(appointment.schedule!).dateTime
            } with Dr. ${appointment.primaryPhysician}`
          : `We regret to inform you that your appointment has been cancelled for the following reason ${appointment.cancellationReason}  `
      }
    `;

    await sendSMsNotification(userId, smsMessage);
    revalidatePath('/admin');
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.log(error);
  }
};

export const sendSMsNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );

    return parseStringify(message);
  } catch (error) {
    console.log('error messaging ', error);
  }
};
