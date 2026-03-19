interface PageHeadlineProps {
  title: string;
  subtitle?: string;
}

export default function PageHeadline({ title, subtitle }: PageHeadlineProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold leading-snug text-black whitespace-pre-line">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base text-black/50">{subtitle}</p>
      )}
    </div>
  );
}
