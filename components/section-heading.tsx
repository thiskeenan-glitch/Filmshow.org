type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  copy?: string;
};

export function SectionHeading({ eyebrow, title, copy }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="copy-wide small-label mb-4 font-semibold text-red-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="section-title text-stone-100">
        {title}
      </h2>
      {copy ? (
        <p className="body-copy mt-6 text-stone-300">
          {copy}
        </p>
      ) : null}
    </div>
  );
}
