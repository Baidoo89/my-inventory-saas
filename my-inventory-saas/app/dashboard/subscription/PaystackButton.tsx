'use client'

import { usePaystackPayment } from 'react-paystack'

interface PaystackButtonProps {
    email: string;
    amount: number;
    publicKey: string;
    onSuccess: (reference: any) => void;
    onClose: () => void;
    className?: string;
    children: React.ReactNode;
}

export default function PaystackButton({ email, amount, publicKey, onSuccess, onClose, className, children }: PaystackButtonProps) {
    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount,
        publicKey: publicKey,
        currency: 'GHS',
        channels: ['mobile_money', 'card'],
    };

    const initializePayment = usePaystackPayment(config);

    return (
        <button 
            // @ts-ignore
            onClick={() => initializePayment(onSuccess, onClose)}
            className={className}
        >
            {children}
        </button>
    );
}
