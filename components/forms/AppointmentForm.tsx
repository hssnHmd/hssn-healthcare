'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { SelectItem } from '@/components/ui/select';
import { Form, FormControl } from '@/components/ui/form';
import { useState } from 'react';

import { createUser, registerPatient } from '@/lib/actions/patient.actions';
import { useRouter } from 'next/navigation';
import {
  CreateAppointmentSchema,
  getAppointmentSchema,
} from '@/lib/validation';
import { Doctors, PatientFormDefaultValues } from '@/constants';
import CustomFormField from '@/components/CustomFormField';
import { FormFieldType } from '@/components/forms/PatientForms';
import Image from 'next/image';
import SubmitButton from '@/components/SubmitButton';
import {
  createAppointment,
  updateAppointment,
} from '@/lib/actions/appointment.action';
import { Appointment } from '@/types/appwrite.types';

const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: 'create' | 'cancel' | 'schedule';
  appointment?: Appointment;
  setOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const AppointmetFormValidation = getAppointmentSchema(type);
  const form = useForm<z.infer<typeof AppointmetFormValidation>>({
    resolver: zodResolver(AppointmetFormValidation),
    defaultValues: {
      ...PatientFormDefaultValues,
      primaryPhysician: appointment ? appointment.primaryPhysician : '',
      reason: appointment ? appointment.reason : '',
      schedule: appointment
        ? new Date(appointment?.schedule)
        : new Date(Date.now()),
      note: appointment ? appointment.note : '',
      cancellationReason: appointment?.cancellationReason || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof AppointmetFormValidation>) => {
    setIsLoading(true);
    let status;
    switch (type) {
      case 'cancel':
        status = 'cancelled';
        break;
      case 'schedule':
        status = 'scheduled';
        break;

      default:
        status = 'pending';
        break;
    }

    try {
      if (type === 'create' && patientId) {
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          note: values.note,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status as Status,
        };
        const newAppointment = await createAppointment(appointmentData);
        if (newAppointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
          );
        }
      } else {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values?.primaryPhysician,
            schedule: new Date(values?.schedule),
            status: status as Status,
            cancellationReason: values?.cancellationReason,
          },
          type,
        };
        const updatedAppointment = await updateAppointment(appointmentToUpdate);
        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  let buttonLabel;
  switch (type) {
    case 'cancel':
      buttonLabel = 'Cancel  appointment';
      break;
    case 'create':
      buttonLabel = 'Create appointment';
      break;
    case 'schedule':
      buttonLabel = 'Schedule appointment';
    default:
      break;
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-12 flex-1"
      >
        {type === 'create' && (
          <section className="space-y-4">
            <h1 className="header">Hi there 👋</h1>
            <p className="text-dark-700">
              Request a new appointment in 10 second
            </p>
          </section>
        )}

        {type !== 'cancel' && (
          <>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Select a doctor"
            >
              {Doctors.map((doctor, i) => (
                <SelectItem key={i} value={doctor.name}>
                  <div className="flex items-center cursor-pointer gap-2">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      width={32}
                      height={32}
                      className="rounder-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>
            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Reasons for appointment"
                placeholder="Ex. Anuel monthly check up"
              />
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Additionnal comments/notes"
                placeholder="Ex.Prefer afternoon appointment if it is possible"
              />
            </div>
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy - H:mm aa"
            />
          </>
        )}
        {type === 'cancel' && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="cancellation reasons"
            placeholder="Ex.Prefer afternoon appointment if it is possible"
          />
        )}
        <SubmitButton
          isLoading={isLoading}
          className={`${
            type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
