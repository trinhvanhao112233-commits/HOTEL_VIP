import React, { useEffect, useState } from "react"
import { getRoomById, updateRoom, getRoomTypeById } from "../utils/ApiFunctions"
import { Link, useParams } from "react-router-dom"
import RoomTypeSelector from "../common/RoomTypeSelector"

const EditRoom = () => {
	const [room, setRoom] = useState({
		photo: "",
		roomTypeId: "",
		roomNumber: "",
		roomTypeName: "",
		price: ""
	})

	const [imagePreview, setImagePreview] = useState("")
	const [successMessage, setSuccessMessage] = useState("")
	const [errorMessage, setErrorMessage] = useState("")
	const { roomId } = useParams()

	const handleImageChange = (e) => {
		const selectedImage = e.target.files[0]
		setRoom({ ...room, photo: selectedImage })
		setImagePreview(URL.createObjectURL(selectedImage))
	}

	const handleInputChange = (event) => {
		const { name, value } = event.target
		setRoom({ ...room, [name]: value })
	}

	useEffect(() => {
		const fetchRoom = async () => {
			try {
				const roomData = await getRoomById(roomId)
				setRoom({
					...roomData,
					roomTypeId: roomData.roomType?.id || "",
					roomTypeName: roomData.roomType?.name || "N/A",
					roomNumber: roomData.roomNumber,
					price: roomData.price || ""
				})
				setImagePreview(roomData.photo)
			} catch (error) {
				console.error(error)
			}
		}

		fetchRoom()
	}, [roomId])

	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			// 1. Update the room details (number, photo, type, individual price)
			const roomResponse = await updateRoom(roomId, room)

			if (roomResponse.status === 200) {
				setSuccessMessage("Room and pricing updated successfully!")
				const updatedRoomData = await getRoomById(roomId)
				setRoom({
					...updatedRoomData,
					roomTypeId: updatedRoomData.roomType?.id || "",
					roomTypeName: updatedRoomData.roomType?.name || "N/A",
					roomNumber: updatedRoomData.roomNumber,
					price: updatedRoomData.price || ""
				})
				setImagePreview(updatedRoomData.photo)
				setErrorMessage("")
			} else {
				setErrorMessage("Error updating room")
			}
		} catch (error) {
			console.error(error)
			setErrorMessage(error.message)
		}
	}

	return (
		<div className="container mt-5 mb-5">
			<h3 className="text-center mb-5 mt-5">Edit Room</h3>
			<div className="row justify-content-center">
				<div className="col-md-8 col-lg-6">
					{successMessage && (
						<div className="alert alert-success" role="alert">
							{successMessage}
						</div>
					)}
					{errorMessage && (
						<div className="alert alert-danger" role="alert">
							{errorMessage}
						</div>
					)}
					<form onSubmit={handleSubmit}>
						<div className="mb-3">
							<label htmlFor="roomNumber" className="form-label hotel-color">
								Room Number
							</label>
							<input
								type="text"
								className="form-control"
								id="roomNumber"
								name="roomNumber"
								value={room.roomNumber}
								onChange={handleInputChange}
							/>
						</div>
						<div className="mb-3">
							<label htmlFor="roomType" className="form-label hotel-color">
								Room Category
							</label>
							<RoomTypeSelector 
								handleRoomInputChange={async (e) => {
									const typeId = e.target.value
									handleInputChange(e)
									// If switching type, we might want to default the price to category price?
									// But user said "do mình tự đặt", so maybe just leave it as is or hint.
									if (typeId && typeId !== "Add New") {
										const typeData = await getRoomTypeById(typeId)
										// Optional: setRoom(prev => ({ ...prev, price: typeData.basePrice }))
									}
								}} 
								newRoom={room} 
							/>
						</div>

						<div className="mb-3">
							<label htmlFor="price" className="form-label hotel-color">
								Room Price ($)
							</label>
							<input
								type="number"
								className="form-control"
								id="price"
								name="price"
								value={room.price}
								onChange={handleInputChange}
							/>
							<small className="text-muted">Note: This price is unique to this specific room.</small>
						</div>

						<div className="mb-3">
							<label htmlFor="photo" className="form-label hotel-color">
								Photo
							</label>
							<input
								required
								type="file"
								className="form-control"
								id="photo"
								name="photo"
								onChange={handleImageChange}
							/>
							{imagePreview && (
								<img
									src={`data:image/png;base64,${imagePreview}`}
									alt="Room preview"
									style={{ maxWidth: "400px", maxHeight: "400" }}
									className="mt-3"
								/>
							)}
						</div>
						<div className="d-grid gap-2 d-md-flex mt-2">
							<Link to={"/existing-rooms"} className="btn btn-outline-info ml-5">
								back
							</Link>
							<button type="submit" className="btn btn-outline-warning">
								Edit Room
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
export default EditRoom
