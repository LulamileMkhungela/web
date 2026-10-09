import { saveMessage } from '@/lib/messages';
import { fail, firstIssue, ok, readJson } from '@/lib/http';
import { messageSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

function requireFields(
  missing: boolean,
  message: string,
): string | null {
  return missing ? message : null;
}

export async function POST(request: Request) {
  const parsed = messageSchema.safeParse(await readJson(request));
  if (!parsed.success) return fail(firstIssue(parsed.error), 422);
  const data = parsed.data;
  const details = data.details ?? {};
  const phoneDigits = (data.phone ?? '').replace(/\D/g, '');

  const problem = (() => {
    switch (data.type) {
      case 'contact':
        return (
          requireFields(data.name.length < 2, 'Please enter your name') ??
          requireFields(!data.email && phoneDigits.length < 9, 'Please give an email address or mobile number so we can reply') ??
          requireFields((data.message ?? '').length < 10, 'Please write a short message (at least 10 characters)')
        );
      case 'catering':
        return (
          requireFields(data.name.length < 2, 'Please enter your name') ??
          requireFields(phoneDigits.length < 9, 'Please enter a mobile number so we can confirm details') ??
          requireFields(!details.eventDate, 'Please choose an event date') ??
          requireFields(!details.guests, 'Please tell us roughly how many guests')
        );
      case 'table':
        return (
          requireFields(data.name.length < 2, 'Please enter your name') ??
          requireFields(phoneDigits.length < 9, 'Please enter a mobile number') ??
          requireFields(!details.date, 'Please choose a date') ??
          requireFields(!details.time, 'Please choose a time') ??
          requireFields(!details.guests, 'Please tell us how many people are coming')
        );
      case 'lunch':
        return (
          requireFields(data.name.length < 2, 'Please enter your name') ??
          requireFields(!details.company, 'Please enter your company or office name') ??
          requireFields(!data.email && phoneDigits.length < 9, 'Please give an email address or mobile number') ??
          requireFields(!details.people, 'Please tell us roughly how many people you are feeding')
        );
      case 'subscribe':
        return (
          requireFields(!data.consent, 'Please tick the box to agree to receive specials from us') ??
          requireFields(!data.email && phoneDigits.length < 9, 'Please enter an email address or mobile number')
        );
      default:
        return 'Unknown enquiry type';
    }
  })();
  if (problem) return fail(problem, 422);

  const id = saveMessage({
    type: data.type,
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    subject: data.subject ?? '',
    body: data.message ?? '',
    details,
  });
  return ok({ ok: true, reference: id.slice(0, 8).toUpperCase() }, 201);
}
