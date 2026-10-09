import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { StaffLogin } from '@/components/staff/StaffLogin';
import { isValidStaffSession, STAFF_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function StaffLoginPage() {
  const jar = await cookies();
  if (isValidStaffSession(jar.get(STAFF_COOKIE)?.value)) redirect('/staff');
  return <StaffLogin />;
}
