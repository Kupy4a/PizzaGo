export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center text-gray-600">
      <p className="rounded-xl bg-white shadow-sm p-6">{children}</p>
    </div>
  );
}
