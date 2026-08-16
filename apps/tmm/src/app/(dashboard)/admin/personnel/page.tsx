import { prismaPersonnel } from '../../../../../modules/personnel/database/client';
import PersonnelListClient from './PersonnelListClient';

export default async function PersonnelManagementPage() {
  const personnelList = await prismaPersonnel.personnel.findMany({
    include: {
      timesheets: {
        orderBy: { scanTime: 'desc' },
        take: 1
      }
    },
    orderBy: { firstName: 'asc' }
  });

  return (
    <PersonnelListClient initialPersonnel={personnelList} />
  );
}
