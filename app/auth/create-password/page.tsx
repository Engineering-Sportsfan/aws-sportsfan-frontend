'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreatePassword from '@/src/components/features/auth/CreatePassword';

function CreatePasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone') || '09876543';

    const handlePasswordCreate = (newPassword: string) => {
        // Redirect to save password page with phone and password as query params
        router.push(`/auth/save-password?phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(newPassword)}`);
    };

    return (
        <CreatePassword 
            phone={phone} 
            onPasswordCreate={handlePasswordCreate}
        />
    );
}

export default function CreatePasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <CreatePasswordPageContent />
        </Suspense>
    );
}
