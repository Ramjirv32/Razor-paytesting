import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function PaymentPage() {


  const navigate = useNavigate();

  const checkPaymentStatus = async (orderId: string) => {
    let retries = 10;
    while (retries > 0) {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/check-status/${orderId}`);
        if (!res.ok) throw new Error('Failed to fetch payment status');
        const data = await res.json();
        if (data.status === 'paid') {
          alert('✅ Payment verified by server');
          navigate('/home');
          return;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
      await new Promise((r) => setTimeout(r, 2000)); // wait 2s
      retries--;
    }
    alert('❌ Payment not confirmed');
  };

  const handlePayment = async () => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/create-order`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: 'INR',
        name: 'Test Razorpay',
        description: 'Test Transaction',
        order_id: data.id,
        handler: function (response: RazorpayResponse) {
            console.log(response);
          alert('✅ Payment initiated. Verifying with server...');
          checkPaymentStatus(data.id);
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('❌ Failed to initiate payment');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>Pay ₹1 using Razorpay</h1>
      <button onClick={handlePayment} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Pay Now
      </button>
    </div>
  );
}

function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>✅ Payment Completed - Welcome Home</h1>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script); // Clean up script on unmount
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}