import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[720px] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="kicker">Page not found</p>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">This plate is empty</h1>
      <p className="mt-5 max-w-md text-lg">
        The page you were looking for has moved or does not exist. Try the menu, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-navy">
          Back to home
        </Link>
        <Link href="/menu" className="btn btn-outline">
          View the menu
        </Link>
      </div>
    </section>
  );
}
