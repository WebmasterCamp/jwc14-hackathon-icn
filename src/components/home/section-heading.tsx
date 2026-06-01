/** Centered section heading with the SparkGo cyan underline accent. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col items-center">
      <h2 className="text-center text-2xl font-bold md:text-3xl">{children}</h2>
      <span className="mt-3 h-1 w-16 rounded-full bg-brand" />
    </div>
  );
}
