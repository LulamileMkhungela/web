import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { StaffConsole } from '@/components/staff/StaffConsole';
import { isValidStaffSession, STAFF_COOKIE } from '@/lib/auth';
import { listCategories, listSpecials } from '@/lib/menu';
import { listMessages } from '@/lib/messages';
import { listOrders } from '@/lib/orders';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const jar = await cookies();
  if (!isValidStaffSession(jar.get(STAFF_COOKIE)?.value)) redirect('/staff/login');
  return (
    <StaffConsole
      initialOrders={listOrders(200)}
      categories={listCategories()}
      specials={listSpecials()}
      messages={listMessages(300)}
      settings={getSiteSettings()}
    />
  );
}
