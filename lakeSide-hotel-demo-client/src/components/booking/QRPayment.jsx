import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getBookingByConfirmationCode } from "../utils/ApiFunctions"
import { Container, Card, Row, Col, Spinner, Button } from "react-bootstrap"
import { FaCheckCircle, FaQrcode, FaInfoCircle, FaArrowLeft } from "react-icons/fa"

const QRPayment = () => {
	const location = useLocation()
	const navigate = useNavigate()
	const { bookingId, totalAmount } = location.state || {}
	
	const [status, setStatus] = useState("PENDING")
	const [isLoading, setIsLoading] = useState(false)
	const [timer, setTimer] = useState(300) // 5 minutes countdown

	// SePay Config
	const ACCOUNT_NUMBER = "0886181632"
	const BANK_NAME = "MB" // MB Bank
	const qrUrl = `https://qr.sepay.vn/img?acc=${ACCOUNT_NUMBER}&bank=${BANK_NAME}&amount=${totalAmount}&des=${bookingId}`

	useEffect(() => {
		if (!bookingId) {
			navigate("/")
			return
		}

		// Polling interval: every 5 seconds
		const interval = setInterval(async () => {
			try {
				const response = await getBookingByConfirmationCode(bookingId)
				if (response.status === "COMPLETED" || response.status === "CONFIRMED") {
					setStatus("COMPLETED")
					clearInterval(interval)
				}
			} catch (error) {
				console.error("Error polling payment status:", error)
			}
		}, 5000)

		// Countdown timer
		const countdown = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					clearInterval(countdown)
					clearInterval(interval)
					return 0
				}
				return prev - 1
			})
		}, 1000)

		return () => {
			clearInterval(interval)
			clearInterval(countdown)
		}
	}, [bookingId, navigate])

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs < 10 ? "0" : ""}${secs}`
	}

	if (status === "COMPLETED") {
		return (
			<Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
				<Card className="border-0 shadow-lg text-center p-5 rounded-4 fade-in" style={{ maxWidth: "500px" }}>
					<Card.Body>
						<FaCheckCircle className="text-success mb-4" style={{ fontSize: "5rem" }} />
						<h2 className="fw-bold mb-3">Payment Successful!</h2>
						<p className="text-muted mb-4">
							Thank you! Your payment for booking <strong>{bookingId}</strong> has been verified successfully.
						</p>
						<Button variant="primary" className="rounded-pill px-5 py-2" onClick={() => navigate("/profile")}>
							View My Bookings
						</Button>
					</Card.Body>
				</Card>
			</Container>
		)
	}

	return (
		<Container className="my-5 py-5 fade-in">
			<Row className="justify-content-center">
				<Col lg={8}>
					<Card className="border-0 shadow-lg rounded-4 overflow-hidden">
						<Row className="g-0">
							{/* Left Side: QR Code */}
							<Col md={5} className="bg-light d-flex flex-column align-items-center justify-content-center p-4">
								<div className="bg-white p-3 rounded-4 shadow-sm mb-3">
									<img src={qrUrl} alt="SePay QR Code" className="img-fluid" style={{ maxWidth: "100%" }} />
								</div>
								<div className="text-center">
									<p className="small mb-1 text-muted">Scan to pay with any Banking App</p>
									<h4 className="fw-bold text-primary mb-0">{totalAmount ? totalAmount.toLocaleString() : "0"} VNĐ</h4>
								</div>
							</Col>

							{/* Right Side: Instructions */}
							<Col md={7} className="p-4 p-lg-5">
								<div className="mb-4">
									<h3 className="fw-bold mb-1">Pay with QR Code</h3>
									<p className="text-muted small">Please complete your payment within <span className="text-danger fw-bold">{formatTime(timer)}</span></p>
								</div>

								<div className="payment-details mb-4">
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted small">Merchant</span>
										<span className="fw-bold small">Lakeside Hotel</span>
									</div>
									<div className="d-flex justify-content-between mb-2">
										<span className="text-muted small">Booking Reference</span>
										<span className="fw-bold small">{bookingId}</span>
									</div>
									<div className="d-flex justify-content-between">
										<span className="text-muted small">Account Name</span>
										<span className="fw-bold small text-uppercase">TRINH VAN HAO</span>
									</div>
								</div>

								<div className="alert alert-info border-0 rounded-3 small d-flex gap-3 mb-4">
									<FaInfoCircle className="fs-4 mt-1" />
									<div>
										<strong>Important:</strong> Please ensure the payment description matches exactly as shown in the QR to avoid delays in automated processing.
									</div>
								</div>

								<div className="d-flex align-items-center gap-3">
									<Spinner animation="border" variant="primary" size="sm" />
									<span className="text-muted small">Waiting for payment verification...</span>
								</div>

								<hr className="my-4 opacity-10" />

								<Button variant="link" className="text-muted text-decoration-none p-0 d-flex align-items-center gap-2 small" onClick={() => navigate("/")}>
									<FaArrowLeft /> Cancel and return home
								</Button>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
		</Container>
	)
}

export default QRPayment
