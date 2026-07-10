'use client';

import { Suspense } from 'react';
import UsernameEntry from '@/src/components/features/auth/UsernameEntry';

export default function UsernamePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <UsernameEntry />
        </Suspense>
    );
}
