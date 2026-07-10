'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SavePasswordPrompt from '@/src/components/features/auth/SavePasswordPrompt';

function SavePasswordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone') || '09876543';
    const password = searchParams.get('password') || '';

    const handleSavePassword = async () => {
        if (password) {
            try {
                // Call API to save password
                const response = await fetch('/api/auth/save-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, password }),
                });

                if (response.ok) {
                    // Redirect to homepage after successful save
                    router.push('/MainModules/HomePage');
                }
            } catch (error) {
                console.error('Failed to save password:', error);
                // Still redirect even if save fails
                router.push('/MainModules/HomePage');
            }
            return;
        }

        // If no password is available in query params, still continue to homepage.
        router.push('/MainModules/HomePage');
    };

    const handleDontSave = () => {
        // User chose not to save, go back to create password screen.
        router.push(`/auth/create-password?phone=${encodeURIComponent(phone)}`);
    };

    return (
        <SavePasswordPrompt 
            phone={phone}
            onYes={handleSavePassword}
            onNo={handleDontSave}
        />
    );
}

export default function SavePasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SavePasswordPageContent />
        </Suspense>
    );
}
