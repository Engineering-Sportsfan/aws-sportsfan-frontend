import { useState } from 'react';
import { storeService, CheckoutPayload } from '@/services/store.service';

export interface RazorpayCheckoutParams {
  productId: string;
  slotId?: string;
  variantId?: string;
  userId: string;
  pricePaise: number;
  idempotencyKey: string;
  paymentMethod: 'upi' | 'gpay' | 'phonepe' | 'paytm' | 'card' | 'wallet';
  onSuccess: (orderId: string) => void;
  onError: (errorMsg: string) => void;
}

export function useRazorpayCheckout() {
  const [loading, setLoading] = useState(false);

  const startPayment = async (params: RazorpayCheckoutParams) => {
    setLoading(true);
    try {
      // 1. Create Razorpay Order
      const res = await storeService.createRazorpayOrder({
        productId: params.productId,
        slotId: params.slotId,
        variantId: params.variantId,
        userId: params.userId,
        idempotencyKey: params.idempotencyKey,
        pricePaise: params.pricePaise,
      });

      // If already completed (idempotency check)
      if (res.success && res.orderId) {
        params.onSuccess(res.orderId);
        return;
      }

      if (!res.razorpayOrderId) {
        throw new Error('Failed to create Razorpay Order.');
      }

      // 2. Map frontend payment methods to Razorpay prefill options
      let razorpayMethod: 'upi' | 'card' | 'wallet' | 'netbanking' = 'upi';
      let walletProvider: string | undefined = undefined;

      if (params.paymentMethod === 'card') {
        razorpayMethod = 'card';
      } else if (params.paymentMethod === 'wallet' || params.paymentMethod === 'paytm') {
        razorpayMethod = 'wallet';
        walletProvider = 'paytm';
      } else {
        razorpayMethod = 'upi';
      }

      // 3. Configure Razorpay modal options
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_z8iSqYm0WqfH1d',
        amount: res.amount,
        currency: res.currency || 'INR',
        name: 'SportsFan Athlete Store',
        description: 'Secure Booking Payment',
        order_id: res.razorpayOrderId,
        prefill: {
          email: params.userId || 'customer@sportsfan360.com',
          method: razorpayMethod,
          ...(walletProvider ? { wallet: walletProvider } : {}),
        },
        handler: async (response: any) => {
          setLoading(true);
          try {
            // 4. Verify payment with the backend
            const verifyRes = await storeService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkoutPayload: {
                productId: params.productId,
                slotId: params.slotId,
                variantId: params.variantId,
                userId: params.userId,
                paymentMethod: params.paymentMethod,
                pricePaise: params.pricePaise,
                idempotencyKey: params.idempotencyKey,
              },
            });

            if (verifyRes.success) {
              params.onSuccess(verifyRes.orderId);
            } else {
              params.onError(verifyRes.error || 'Payment verification failed');
            }
          } catch (verifyErr: any) {
            params.onError(verifyErr.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: {
          color: '#c9115f',
        },
      };

      // Attempt to skip payment method picker page where supported by Razorpay
      options.config = {
        display: {
          blocks: {
            banks: {
              name: 'Pay Securely',
              instruments: [
                {
                  method: razorpayMethod,
                  ...(walletProvider ? { wallets: [walletProvider] } : {}),
                },
              ],
            },
          },
          sequence: ['block.banks'],
          preferences: {
            show_default_blocks: false,
          },
        },
      };

      if (!(window as any).Razorpay) {
        throw new Error('Razorpay SDK not loaded yet. Please wait a moment.');
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        params.onError(resp.error.description || 'Payment transaction failed');
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      params.onError(err.message || 'Payment execution failed');
      setLoading(false);
    }
  };

  return {
    startPayment,
    loading,
  };
}
