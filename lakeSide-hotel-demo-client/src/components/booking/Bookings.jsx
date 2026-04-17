import React, { useState, useEffect } from "react"
import { cancelBooking, getAllBookings } from "../utils/ApiFunctions"
import Header from "../common/Header"
import BookingsTable from "./BookingsTable"

const Bookings = () => {
	const [bookingInfo, setBookingInfo] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		setTimeout(() => {
			getAllBookings()
				.then((data) => {
					setBookingInfo(data)
					setIsLoading(false)
				})
				.catch((error) => {
					setError(error.message)
					setIsLoading(false)
				})
		}, 1000)
	}, [])

	const handleBookingCancellation = async (bookingId) => {
		console.log("Button clicked for ID:", bookingId)
		const confirmed = window.confirm("Are you sure you want to cancel this booking?")
		if (!confirmed) {
			console.log("Cancellation aborted by user.")
			return
		}
		
		console.log("Proceeding with cancellation for ID:", bookingId)
		try {
			await cancelBooking(bookingId)
			console.log("API call successful for ID:", bookingId)
			const data = await getAllBookings()
			setBookingInfo(data)
			alert("Booking cancelled successfully!")
		} catch (error) {
			console.error("Cancellation failed:", error)
			setError(error.message)
		}
	}

	return (
		<section style={{ backgroundColor: "whitesmoke" }}>
			<Header title={"Existing Bookings"} />
			{error && (
				<div className="container mt-2">
					<div className="alert alert-danger alert-dismissible fade show shadow-sm border-0 rounded-4" role="alert">
						<i className="bi bi-exclamation-triangle-fill me-2"></i>
						<strong>Access Denied or Error:</strong> {error}
						<button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
					</div>
				</div>
			)}
			{isLoading ? (
				<div>Loading existing bookings</div>
			) : (
				<BookingsTable
					bookingInfo={bookingInfo}
					handleBookingCancellation={handleBookingCancellation}
				/>
			)}
		</section>
	)
}

export default Bookings
