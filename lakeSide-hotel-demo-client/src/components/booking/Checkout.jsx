import React, { useEffect, useState } from "react"
import BookingForm from "../booking/BookingForm"
import {
	FaUtensils,
	FaWifi,
	FaTv,
	FaWineGlassAlt,
	FaParking,
	FaCar,
	FaTshirt
} from "react-icons/fa"

import { useParams } from "react-router-dom"
import { getRoomById } from "../utils/ApiFunctions"
import RoomCarousel from "../common/RoomCarousel"

const Checkout = () => {
	const [error, setError] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [selectedRooms, setSelectedRooms] = useState([])

	const { roomId } = useParams()

	useEffect(() => {
		if (roomId) {
			setTimeout(() => {
				getRoomById(roomId)
					.then((response) => {
						setSelectedRooms([response])
						setIsLoading(false)
					})
					.catch((error) => {
						setError(error)
						setIsLoading(false)
					})
			}, 1000)
		} else {
			const rooms = JSON.parse(localStorage.getItem("selectedRooms") || "[]")
			setSelectedRooms(rooms)
			setIsLoading(false)
		}
	}, [roomId])

	return (
		<div>
			<section className="container">
				<div className="row">
					<div className="col-md-4 mt-5 mb-5">
						{isLoading ? (
							<p>Loading room information...</p>
						) : error ? (
							<p className="text-danger">{error}</p>
						) : selectedRooms.length === 0 ? (
							<div className="alert alert-warning">No rooms selected for booking. Please go back to browse rooms.</div>
						) : (
							<div className="room-info">
								<h4 className="mb-3">Selected Rooms</h4>
								{selectedRooms.map((room, index) => (
									<div key={index} className="mb-3 p-2 border rounded shadow-sm bg-white">
										<img
											src={`data:image/png;base64,${room.photo}`}
											alt="Room photo"
											style={{ width: "100%", height: "120px", objectFit: "cover" }}
											className="mb-2"
										/>
										<table className="table table-sm table-bordered mb-0">
											<tbody>
												<tr>
													<th>Type:</th>
													<td>{room.roomType?.name || "N/A"}</td>
												</tr>
												<tr>
													<th>Price:</th>
													<td>${room.roomType?.basePrice || 0} / night</td>
												</tr>
											</tbody>
										</table>
									</div>
								))}
								<div className="mt-4 p-3 bg-light rounded">
									<h6>Included Services:</h6>
									<ul className="list-unstyled small">
										<li><FaWifi /> Free High-speed Wifi</li>
										<li><FaTv /> Netflix Premium</li>
										<li><FaUtensils /> Daily Breakfast</li>
										<li><FaWineGlassAlt /> Welcome Refreshments</li>
										<li><FaCar /> Airport Pickup</li>
									</ul>
								</div>
							</div>
						)}
					</div>
					<div className="col-md-8">
						<BookingForm selectedRooms={selectedRooms} />
					</div>
				</div>
			</section>
			<div className="container">
				<RoomCarousel />
			</div>
		</div>
	)
}
export default Checkout
