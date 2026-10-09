import { Clock } from 'lucide-react';
import { LONG_DAYS } from '@/lib/config';
import type { Hours } from '@/lib/types';

/** Opening hours listed Monday to Sunday. */
export function OpeningHours({ hours, tone = 'light' }: { hours: Hours; tone?: 'light' | 'dark' }) {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const dark = tone === 'dark';
  return (
    <div>
      <p className={`flex items-center gap-2 text-lg font-semibold ${dark ? 'text-cream' : 'text-navy'}`}>
        <Clock className={`h-5 w-5 ${dark ? 'text-ochre-bright' : 'text-ochre-deep'}`} aria-hidden="true" />
        Opening hours
      </p>
      <table className="mt-3 w-full border-collapse text-left text-[0.97rem]">
        <tbody>
          {order.map((index) => {
            const day = hours[index];
            return (
              <tr key={index} className={`border-t ${dark ? 'border-white/15' : 'border-line'}`}>
                <th scope="row" className={`py-2.5 pr-4 font-semibold ${dark ? 'text-cream' : 'text-navy'}`}>
                  {LONG_DAYS[index]}
                </th>
                <td className={`py-2.5 ${dark ? 'text-cream/85' : ''}`}>{day ? `${day.open} to ${day.close}` : 'Closed'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`mt-3 text-sm ${dark ? 'text-cream/70' : 'text-muted'}`}>Times are South African time (SAST).</p>
    </div>
  );
}
