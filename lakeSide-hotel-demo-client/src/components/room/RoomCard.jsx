import React, { useContext, useEffect, useState } from "react"
import { Card, Col } from "react-bootstrap"
import { Link } from "react-router-dom"

const RoomCard = ({ room }) => {
	const [isSelected, setIsSelected] = useState(false)

	useEffect(() => {
		const selectedRooms = JSON.parse(localStorage.getItem("selectedRooms") || "[]")
		setIsSelected(selectedRooms.some((selectedRoom) => selectedRoom.id === room.id))
	}, [room.id])

	const handleToggleSelect = () => {
		const selectedRooms = JSON.parse(localStorage.getItem("selectedRooms") || "[]")
		let updatedRooms
		if (isSelected) {
			updatedRooms = selectedRooms.filter((selectedRoom) => selectedRoom.id !== room.id)
		} else {
			updatedRooms = [...selectedRooms, room]
		}
		localStorage.setItem("selectedRooms", JSON.stringify(updatedRooms))
		setIsSelected(!isSelected)
		window.dispatchEvent(new Event("cartUpdated"))
	}

	return (
		<Col key={room.id} className="mb-4" xs={12}>
			<Card className="room-card">
				<Card.Body className="d-flex flex-wrap align-items-center p-0">
					<div className="flex-shrrink-0">
						<Link to={`/book-room/${room.id}`}>
							<Card.Img
								variant="top"
								src={room.photo ? `data:image/png;base64,${room.photo}` : "https://via.placeholder.com/300x200?text=No+Photo"}
								alt="Room Photo"
								style={{ width: "300px", height: "200px", objectFit: "cover" }}
							/>
						</Link>
					</div>
					<div className="flex-grow-1 p-4">
						<Card.Title className="hotel-color h4 mb-2">{room.roomType ? room.roomType.name : "N/A"}</Card.Title>
						<Card.Text className="text-muted mb-3">Experience ultimate comfort and luxury in our most refined rooms.</Card.Text>
						<div className="d-flex align-items-center gap-3">
							<span className="room-price">{room.price ? room.price.toLocaleString() : "0"} VNĐ</span>
							<span className="text-muted small">/ night</span>
						</div>
					</div>
					<div className="p-4 d-flex flex-column gap-2">
						<Link to={`/book-room/${room.id}`} className="btn btn-outline-secondary btn-sm rounded-pill px-4">
							Detail
						</Link>
						<button
							className={`btn btn-sm rounded-pill px-4 ${isSelected ? "btn-danger" : "btn-hotel"}`}
							onClick={handleToggleSelect}>
							{isSelected ? "Remove" : "Book Now"}
						</button>
					</div>
				</Card.Body>
			</Card>
		</Col>
	)
}

export default RoomCard
