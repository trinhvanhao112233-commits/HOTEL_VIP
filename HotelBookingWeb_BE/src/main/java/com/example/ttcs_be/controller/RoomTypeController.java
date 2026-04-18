package com.example.ttcs_be.controller;

import com.example.ttcs_be.response.RoomTypeResponse;
import com.example.ttcs_be.model.RoomType;
import com.example.ttcs_be.service.IRoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/room-types")
public class RoomTypeController {

    private final IRoomTypeService roomTypeService;

    // 1. Thêm loại phòng mới (Hỗ trợ tải ảnh)
    @PostMapping("/add")
    public ResponseEntity<RoomTypeResponse> addRoomType(
            @RequestParam("name") String name,
            @RequestParam("basePrice") BigDecimal basePrice,
            @RequestParam("maxCapacity") int maxCapacity,
            @RequestParam("description") String description,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        RoomType savedRoomType = roomTypeService.addRoomType(name, basePrice, maxCapacity, description, photo);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(savedRoomType));
    }

    // 2. Lấy danh sách tất cả loại phòng
    @GetMapping("/all")
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomTypes() {
        List<RoomType> roomTypes = roomTypeService.getAllRoomTypes();
        List<RoomTypeResponse> responseList = roomTypes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }

    // 3. Lấy thông tin một loại phòng cụ thể bằng ID
    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> getRoomTypeById(@PathVariable Long id) {
        RoomType roomType = roomTypeService.getRoomTypeById(id);
        return ResponseEntity.ok(mapToResponse(roomType));
    }

    // 4. Cập nhật thông tin loại phòng (Hỗ trợ tải ảnh mới)
    @PutMapping("/update/{id}")
    public ResponseEntity<RoomTypeResponse> updateRoomType(
            @PathVariable Long id,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "basePrice", required = false) BigDecimal basePrice,
            @RequestParam(value = "maxCapacity", required = false) Integer maxCapacity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {
        RoomType updatedRoomType = roomTypeService.updateRoomType(id, name, basePrice, maxCapacity != null ? maxCapacity : 0, description, photo);
        return ResponseEntity.ok(mapToResponse(updatedRoomType));
    }

    // 5. Xóa loại phòng
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Long id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.noContent().build();
    }

    // Hàm Helper hỗ trợ ánh xạ (map) từ Entity sang DTO
    private RoomTypeResponse mapToResponse(RoomType roomType) {
        return new RoomTypeResponse(
                roomType.getId(),
                roomType.getName(),
                roomType.getBasePrice(),
                roomType.getMaxCapacity(),
                roomType.getDescription(),
                roomType.getPhoto()
        );
    }
}
