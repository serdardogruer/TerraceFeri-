export const dynamic = 'force-dynamic';

import { prismaPersonnel } from '../../../../../modules/personnel/database/client';
import PersonnelListClient from './PersonnelListClient';

interface Timesheet {
  id: string;
  type: string;
  scanTime: Date | string;
}

interface PersonnelItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  tcNo: string | null;
  shiftStartTime: string;
  shiftEndTime: string;
  status: string;
  timesheets: Timesheet[];
}

export default async function PersonnelManagementPage() {
  let personnelList: PersonnelItem[] = [];
  try {
    personnelList = await prismaPersonnel.personnel.findMany({
      include: {
        timesheets: {
          orderBy: { scanTime: 'desc' },
          take: 1
        }
      },
      orderBy: { firstName: 'asc' }
    });
  } catch (error) {
    console.error('Personnel çekme hatası:', error);
    personnelList = [];
  }

  return (
    <PersonnelListClient initialPersonnel={personnelList} />
  );
}
