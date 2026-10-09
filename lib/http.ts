import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function firstIssue(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? 'Please check the details and try again.';
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
