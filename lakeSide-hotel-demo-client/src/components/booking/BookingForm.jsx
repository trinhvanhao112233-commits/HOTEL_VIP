import React, { useEffect } from "react"
import moment from "moment"
import { useState } from "react"
import { Form, FormControl, Button } from "react-bootstrap"
import BookingSummary from "./BookingSummary"
import { bookRoom } from "../utils/ApiFunctions"
import { useNavigate } from "react-router-dom"

const BookingForm = ({ selectedRooms = [] }) => {
	const [validated, setValidated] = useState(false)
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	const currentUserEmail = localStorage.getItem("userEmail")

	const [booking, setBooking] = useState({
		guestFullName: "",
		guestEmail: currentUserEmail,
		checkInDate: "",
		checkOutDate: "",
		numOfAdults: "",
		numOfChildren: ""
	})

	const navigate = useNavigate()

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setBooking({ ...booking, [name]: value })
		setErrorMessage("")
	}

	const calculatePayment = () => {
		const checkInDate = moment(booking.checkInDate)
		const checkOutDate = moment(booking.checkOutDate)
		const diffInDays = checkOutDate.diff(checkInDate, "days")
		const totalRoomPricePerNight = selectedRooms.reduce((acc, room) => acc + (room.roomType?.basePrice || 0), 0)
		return diffInDays > 0 ? diffInDays * totalRoomPricePerNight : 0
	}

	const isGuestCountValid = () => {
		const adultCount = parseInt(booking.numOfAdults)
		const childrenCount = parseInt(booking.numOfChildren)
		const totalCount = (isNaN(adultCount) ? 0 : adultCount) + (isNaN(childrenCount) ? 0 : childrenCount)
		
		if (isNaN(adultCount) || adultCount < 1) {
			setErrorMessage("Phải có ít nhất 1 người lớn.")
			return false
		}
		if (totalCount < 1) {
			setErrorMessage("Số lượng khách ít nhất phải là 1.")
			return false
		}
		return true
	}

	const isEmailValid = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!booking.guestEmail || !emailRegex.test(booking.guestEmail)) {
			setErrorMessage("Email không hợp lệ. Vui lòng kiểm tra lại thông tin tài khoản.")
			return false
		}
		return true
	}

	const isCheckOutDateValid = () => {
		if (!moment(booking.checkOutDate).isSameOrAfter(moment(booking.checkInDate))) {
			setErrorMessage("Check-out date must be after check-in date")
			return false
		} else {
			setErrorMessage("")
			return true
		}
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		const form = e.currentTarget
		setErrorMessage("") // Clear previous errors
		
		if (form.checkValidity() === false || !isEmailValid() || !isGuestCountValid() || !isCheckOutDateValid()) {
			e.stopPropagation()
		} else {
			setIsSubmitted(true)
		}
		setValidated(true)
	}

	const handleFormSubmit = async () => {
		try {
			if (selectedRooms.length === 0) {
				setErrorMessage("No rooms selected.")
				return
			}

			// Create the BookingRequest object for the new backend architecture
			const bookingRequest = {
				userId: localStorage.getItem("userId"), // Numeric ID from AuthProvider
				checkIn: booking.checkInDate,
				checkOut: booking.checkOutDate,
				guestName: booking.guestFullName,
				selectedRooms: selectedRooms.map(room => ({
					roomId: room.id,
					numAdults: parseInt(booking.numOfAdults),
					numChildren: parseInt(booking.numOfChildren)
				}))
			}
			
			const result = await bookRoom(bookingRequest)
			
			// Clear local storage choice after successful booking
			localStorage.removeItem("selectedRooms")
			
			// Thay vì báo thành công luôn, chuyển hướng người dùng sang trang thanh toán QR
			navigate("/payment/qr", { 
				state: { 
					bookingId: result.confirmationCode, 
					totalAmount: result.totalAmount 
				} 
			})
		} catch (error) {
			const errorMessage = error.message
			navigate("/booking-success", { state: { error: errorMessage } })
		}
	}

	return (
		<>
			<div className="container mb-5">
				<div className="row">
					<div className="col-md-6">
						<div className="card card-body mt-5 shadow">
							<h4 className="card-title text-center mb-4">Reserve Selected Rooms</h4>

							<Form noValidate validated={validated} onSubmit={handleSubmit}>
								<Form.Group className="mb-3">
									<Form.Label htmlFor="guestFullName" className="hotel-color">
										Fullname
									</Form.Label>
									<FormControl
										required
										type="text"
										id="guestFullName"
										name="guestFullName"
										value={booking.guestFullName}
										placeholder="Enter your fullname"
										onChange={handleInputChange}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter your fullname.
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label htmlFor="guestEmail" className="hotel-color">
										Email
									</Form.Label>
									<FormControl
										required
										type="email"
										id="guestEmail"
										name="guestEmail"
										value={booking.guestEmail}
										placeholder="Enter your email"
										onChange={handleInputChange}
										disabled
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid email address.
									</Form.Control.Feedback>
								</Form.Group>

								<fieldset className="border p-3 mb-3 rounded">
									<legend className="w-auto px-2 fs-6 fw-bold">Lodging Period</legend>
									<div className="row">
										<div className="col-6">
											<Form.Label htmlFor="checkInDate" className="hotel-color">
												Check-in date
											</Form.Label>
											<FormControl
												required
												type="date"
												id="checkInDate"
												name="checkInDate"
												value={booking.checkInDate}
												min={moment().format("YYYY-MM-DD")}
												onChange={handleInputChange}
											/>
										</div>

										<div className="col-6">
											<Form.Label htmlFor="checkOutDate" className="hotel-color">
												Check-out date
											</Form.Label>
											<FormControl
												required
												type="date"
												id="checkOutDate"
												name="checkOutDate"
												value={booking.checkOutDate}
												min={moment().format("YYYY-MM-DD")}
												onChange={handleInputChange}
											/>
										</div>
										{errorMessage && <p className="error-message text-danger mt-2">{errorMessage}</p>}
									</div>
								</fieldset>

								<fieldset className="border p-3 mb-4 rounded">
									<legend className="w-auto px-2 fs-6 fw-bold">Number of Guest</legend>
									<div className="row">
										<div className="col-6">
											<Form.Label htmlFor="numOfAdults" className="hotel-color">
												Adults
											</Form.Label>
											<FormControl
												required
												type="number"
												id="numOfAdults"
												name="numOfAdults"
												value={booking.numOfAdults}
												min={1}
												placeholder="0"
												onChange={handleInputChange}
											/>
										</div>
										<div className="col-6">
											<Form.Label htmlFor="numOfChildren" className="hotel-color">
												Children
											</Form.Label>
											<FormControl
												required
												type="number"
												id="numOfChildren"
												name="numOfChildren"
												value={booking.numOfChildren}
												placeholder="0"
												min={0}
												onChange={handleInputChange}
											/>
										</div>
									</div>
								</fieldset>

								<div className="d-grid">
									<button type="submit" className="btn btn-hotel">
										Review and Confirm
									</button>
								</div>
							</Form>
						</div>
					</div>

					<div className="col-md-6">
						{isSubmitted && (
							<BookingSummary
								booking={booking}
								payment={calculatePayment()}
								onConfirm={handleFormSubmit}
								isFormValid={validated}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
export default BookingForm
