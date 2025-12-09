import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader, CreditCard, Shield } from "lucide-react";

interface PayPalButtonProps {
  planType: "starter" | "professional" | "enterprise";
  planName: string;
  amount: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  className?: string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  planType,
  planName,
  amount,
  onSuccess,
  onError,
  onCancel,
  className = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Firebase token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please sign in to continue");
      }

      // Create PayPal order
      const createResponse = await fetch(
        "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planType }),
        }
      );

      const createData = await createResponse.json();

      if (!createData.success) {
        throw new Error(createData.error || "Failed to create payment order");
      }

      // Redirect to PayPal for approval
      if (createData.approvalUrl) {
        // Open PayPal in new window
        const paypalWindow = window.open(
          createData.approvalUrl,
          "PayPal",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        if (!paypalWindow) {
          throw new Error("Please allow popups to complete payment");
        }

        setProcessing(true);

        // Set up postMessage listener for secure communication
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'PAYPAL_PAYMENT_COMPLETE') {
            clearInterval(checkInterval);
            setProcessing(false);
            window.removeEventListener('message', handleMessage);
            
            // Handle payment completion
            if (event.data.success) {
              onSuccess(event.data);
            } else {
              setError('Payment was cancelled or failed');
            }
            return;
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Poll for payment completion with postMessage fallback
        const checkInterval = setInterval(async () => {
          try {
            if (paypalWindow.closed) {
              clearInterval(checkInterval);
              setProcessing(false);
              window.removeEventListener('message', handleMessage);

              // Check if payment was completed
              try {
                const captureResponse = await fetch(
                  "http://irpwi5mww.ap-southeast-2.awsapprunner.com/api/payment/capture-order",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ orderId: createData.orderId }),
                  }
                );

                const captureData = await captureResponse.json();

                if (captureData.success) {
                  setSuccess(true);
                  if (onSuccess) {
                    onSuccess(captureData);
                  }
                } else {
                  if (onCancel) {
                    onCancel();
                  }
                }
              } catch (captureError) {
                console.error("Error capturing payment:", captureError);
                if (onCancel) {
                  onCancel();
                }
              }

              setLoading(false);
            }
          } catch (error) {
            console.error("Error checking window status:", error);
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          window.removeEventListener('message', handleMessage);
          if (paypalWindow && !paypalWindow.closed) {
            paypalWindow.close();
          }
          setProcessing(false);
          setLoading(false);
        }, 600000);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setLoading(false);
      setProcessing(false);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 text-center"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-emerald-400 mb-1">
              Payment Successful!
            </h3>
            <p className="text-sm text-slate-300">
              Your {planName} subscription is now active
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2"
              >
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading || processing}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 
                       hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 
                       disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600
                       text-white font-semibold py-4 px-6 rounded-xl 
                       transition-all duration-300 shadow-lg hover:shadow-2xl 
                       disabled:cursor-not-allowed disabled:opacity-50
                       flex items-center justify-center gap-3 group"
            >
              {loading || processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>
                    {processing ? "Waiting for PayPal..." : "Creating Order..."}
                  </span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Pay ${amount} with PayPal</span>
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4" />
              <span>Secure payment powered by PayPal</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayPalButton;
