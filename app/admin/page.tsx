import StatCard from '@/components/StatCard';
import { columns } from '@/components/table/columns';
import { DataTable } from '@/components/table/Data-table';
import { getRecentAppointments } from '@/lib/actions/appointment.action';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Admin = async () => {
  const appointments = await getRecentAppointments();
  console.log(appointments.documents);
  return (
    <div className="flex max-w-7xl flex-col mx-auto space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="logo"
            width={162}
            height={32}
            className="h-8 w-full"
          />
        </Link>
        <p className="text-16-semibold">admin dashboard</p>
      </header>
      <main className="admin-main">
        <section className="w-full space-y-6">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            start the day by managing the appointments
          </p>
        </section>
        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="canceled appointments"
            icon="/assets/icons/cancelled.svg"
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="pending appointments"
            icon="/assets/icons/pending.svg"
          />
        </section>
        <DataTable columns={columns} data={appointments.documents} />
      </main>
    </div>
  );
};

export default Admin;
