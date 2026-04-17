package com.example.ttcs_be.service;

import com.example.ttcs_be.exception.ResourceAlreadyExistsException;
import com.example.ttcs_be.exception.ResourceNotFoundException;
import com.example.ttcs_be.model.RoomType;
import com.example.ttcs_be.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeServiceImpl implements IRoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    @Override
    public RoomType addRoomType(RoomType roomTypeRequest) {
        // Kiểm tra xem tên loại phòng đã tồn tại chưa để tránh trùng lặp
        if (roomTypeRepository.existsByName(roomTypeRequest.getName())) {
            throw new ResourceAlreadyExistsException("Loại phòng mang tên '" + roomTypeRequest.getName() + "' đã tồn tại!");
        }
        return roomTypeRepository.save(roomTypeRequest);
    }

    @Override
    public List<RoomType> getAllRoomTypes() {
        // Lấy danh sách toàn bộ cấu hình loại phòng
        return roomTypeRepository.findAll();
    }

    @Override
    public RoomType getRoomTypeById(Long id) {
        // Trả về Exception nếu không tìm thấy
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại phòng với ID: " + id));
    }

    @Override
    public RoomType updateRoomType(Long id, RoomType roomTypeRequest) {
        // 1. Tìm loại phòng cũ
        RoomType existingRoomType = getRoomTypeById(id);

        // 2. Cập nhật các thông tin mới (chỉ cập nhật nếu có dữ liệu mới)
        if (roomTypeRequest.getName() != null && !roomTypeRequest.getName().isEmpty()) {
            existingRoomType.setName(roomTypeRequest.getName());
        }
        if (roomTypeRequest.getBasePrice() != null) {
            existingRoomType.setBasePrice(roomTypeRequest.getBasePrice());
        }
        if (roomTypeRequest.getMaxCapacity() > 0) {
            existingRoomType.setMaxCapacity(roomTypeRequest.getMaxCapacity());
        }
        if (roomTypeRequest.getDescription() != null) {
            existingRoomType.setDescription(roomTypeRequest.getDescription());
        }

        // 3. Lưu lại vào database
        return roomTypeRepository.save(existingRoomType);
    }

    @Override
    public void deleteRoomType(Long id) {
        // Kiểm tra xem có tồn tại không trước khi xóa
        RoomType roomType = getRoomTypeById(id);
        roomTypeRepository.delete(roomType);
    }
}
