import React, { useState, useEffect } from "react"
import { getRoomTypes, addRoomType } from "../utils/ApiFunctions"

const RoomTypeSelector = ({ handleRoomInputChange, newRoom }) => {
	const [roomTypes, setRoomTypes] = useState([])
	const [showNewRoomTypeInput, setShowNewRoomTypeInput] = useState(false)
	const [newRoomType, setNewRoomType] = useState({
		name: "",
		basePrice: "",
		maxCapacity: ""
	})
	const [successMessage, setSuccessMessage] = useState("")
	const [errorMessage, setErrorMessage] = useState("")

	useEffect(() => {
		getRoomTypes()
			.then((data) => {
				setRoomTypes(data)
			})
			.catch((error) => {
				console.error(error.message)
			})
	}, [])

	const handleNewRoomTypeInputChange = (e) => {
		const { name, value } = e.target
		setNewRoomType({ ...newRoomType, [name]: value })
	}

	const handleAddNewRoomType = async () => {
		if (newRoomType.name !== "" && newRoomType.basePrice !== "" && newRoomType.maxCapacity !== "") {
			try {
				const response = await addRoomType(newRoomType)
				setRoomTypes([...roomTypes, response])
				setNewRoomType({ name: "", basePrice: "", maxCapacity: "" })
				setShowNewRoomTypeInput(false)
				setSuccessMessage("Loại phòng mới đã được thêm thành công!")
				setErrorMessage("")
				
				// Automatically select the new room type
				handleRoomInputChange({
					target: {
						name: "roomTypeId",
						value: response.id
					}
				})
			} catch (error) {
				setErrorMessage(error.message)
				setSuccessMessage("")
			}
			setTimeout(() => {
				setSuccessMessage("")
				setErrorMessage("")
			}, 3000)
		}
	}

	return (
		<>
			<div>
				{successMessage && <div className="alert alert-success mt-2">{successMessage}</div>}
				{errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}
				
				<select
					required
					className="form-select"
					name="roomTypeId"
					onChange={(e) => {
						if (e.target.value === "Add New") {
							setShowNewRoomTypeInput(true)
						} else {
							handleRoomInputChange(e)
						}
					}}
					value={newRoom.roomTypeId}>
					<option value="">Select a room type</option>
					<option value={"Add New"}>Add New</option>
					{roomTypes.map((type) => (
						<option key={type.id} value={type.id}>
							{type.name}
						</option>
					))}
				</select>
				{showNewRoomTypeInput && (
					<div className="mt-2 p-3 border rounded bg-light">
						<h5>Add New Room Type</h5>
						<div className="mb-2">
							<input
								type="text"
								className="form-control"
								name="name"
								placeholder="Room Type Name (e.g. Deluxe)"
								value={newRoomType.name}
								onChange={handleNewRoomTypeInputChange}
							/>
						</div>
						<div className="mb-2">
							<input
								type="number"
								className="form-control"
								name="basePrice"
								placeholder="Base Price"
								value={newRoomType.basePrice}
								onChange={handleNewRoomTypeInputChange}
							/>
						</div>
						<div className="mb-2">
							<input
								type="number"
								className="form-control"
								name="maxCapacity"
								placeholder="Max Capacity"
								value={newRoomType.maxCapacity}
								onChange={handleNewRoomTypeInputChange}
							/>
						</div>
						<div className="d-flex gap-2">
							<button className="btn btn-hotel btn-sm" type="button" onClick={handleAddNewRoomType}>
								Add
							</button>
							<button 
								className="btn btn-outline-secondary btn-sm" 
								type="button" 
								onClick={() => setShowNewRoomTypeInput(false)}>
								Cancel
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	)
}

export default RoomTypeSelector
