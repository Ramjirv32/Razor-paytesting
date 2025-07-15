import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function PaymentPage() {
  const navigate = useNavigate();

  const handlePayment = async () => {
    const res = await fetch('https://bluegill-resolved-marginally.ngrok-free.app/create-order', {
      method: 'POST',
    });

    const data = await res.json();
    const key1 = import.meta.env.VITE_RAZORPAY_KEY;

    const options = {
      key: key1,
      amount: data.amount,
      currency: 'INR',
      name: 'Test Razorpay',
      description: 'Test Transaction',
      order_id: data.id,
      handler: function (response) {
        alert('Payment Success!');
        navigate('/home');
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}