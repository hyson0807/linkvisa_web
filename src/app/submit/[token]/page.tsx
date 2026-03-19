'use client';

import { use } from 'react';
import SubmitPageClient from './_components/SubmitPageClient';

export default function SubmitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  return <SubmitPageClient token={token} />;
}
