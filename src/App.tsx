"use client"

import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"
import { useEffect } from "react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

function PaymentPage() {
  const navigate = useNavigate()

  const checkPaymentStatus = async (orderId: string) => {
    let retries = 10
    while (retries > 0) {
      try {
        // Use localhost:5000 directly since we're in development
        const res = await fetch(`http://localhost:5000/check-status/${orderId}`)
        if (!res.ok) throw new Error("Failed to fetch payment status")
        const data = await res.json()
        if (data.status === "paid") {
          alert("✅ Payment verified by server")
          navigate("/home")
          return
        }
      } catch (error) {
        console.error("Error checking payment status:", error)
      }
      await new Promise((r) => setTimeout(r, 2000)) // wait 2s
      retries--
    }
    alert("❌ Payment not confirmed")
  }

  const handlePayment = async () => {
    try {
      // Use localhost:5000 directly since we're in development
      const res = await fetch(`http://localhost:5000/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to create order")
      const data = await res.json()

      // Use the live key from your backend
      const options = {
        key: "rzp_live_g3vgHUNX2fyX6l", // Your live key from backend
        amount: data.amount,
        currency: "INR",
        name: "Test Razorpay",
        description: "Test Transaction",
        order_id: data.id,
        handler: (response: RazorpayResponse) => {
          console.log("Payment response:", response)
          alert("✅ Payment initiated. Verifying with server...")
          checkPaymentStatus(data.id)
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            alert("Payment cancelled")
          },
        },
      }

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        alert("Razorpay SDK not loaded. Please refresh the page.")
      }
    } catch (error) {
      console.error("Error initiating payment:", error)
      alert("❌ Failed to initiate payment. Make sure your backend server is running on port 5000.")
    }
  }

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 100,
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Pay ₹1 using Razorpay</h1>
      <p>Make sure your backend server is running on port 5000</p>
      <button
        onClick={handlePayment}
        style={{
          padding: "15px 30px",
          fontSize: "16px",
          backgroundColor: "#3399cc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Pay Now
      </button>
    </div>
  )
}

function HomePage() {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: 100,
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>✅ Payment Completed - Welcome Home</h1>
      <p>Your payment has been successfully processed!</p>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    // Check if Razorpay script is already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => {
        console.log("Razorpay SDK loaded successfully")
      }
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK")
        alert("Failed to load Razorpay SDK. Please check your internet connection.")
      }
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  )
}
