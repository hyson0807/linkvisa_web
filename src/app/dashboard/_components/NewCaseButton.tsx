import Link from 'next/link';

export default function NewCaseButton() {
  return (
    <Link
      href="/cases/new"
      className="inline-block rounded-xl bg-primary px-8 py-4 text-[17px] font-semibold text-white transition-colors hover:bg-primary-hover"
    >
      + 새 케이스 만들기
    </Link>
  );
}
