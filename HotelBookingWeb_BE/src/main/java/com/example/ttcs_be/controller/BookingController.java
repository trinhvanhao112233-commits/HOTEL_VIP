package com.example.ttcs_be.controller;

import com.example.ttcs_be.request.BookingRequest;
import com.example.ttcs_be.response.BookingResponse;
import com.example.ttcs_be.response.BookingRoomResponse;
import com.example.ttcs_be.exception.InvalidBookingRequestException;
import com.example.ttcs_be.exception.ResourceNotFoundException;
import com.example.ttcs_be.model.Booking;
import com.example.ttcs_be.service.IBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bookings")
public class BookingController {

    private final IBookingService bookingService;

    // 1. Lưu giỏ hàng (Đặt nhiều phòng cùng lúc) - API tùy chỉnh cho kiến trúc 7 bảng
    @PostMapping("/book")
    public ResponseEntity<?> saveBookings(@RequestBody BookingRequest bookingRequest) {
        try {
            // Không cần nhận roomId trên URL nữa vì danh sách phòng đã nằm trong BookingRequest
            String confirmationCode = bookingService.saveBooking(bookingRequest);
            Booking booking = bookingService.getBookingByConfirmationCode(confirmationCode);
            return ResponseEntity.ok(getBookingResponse(booking));
        } catch (InvalidBookingRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // [2]
        }
    }

    // 2. Lấy tất cả các đơn đặt phòng [5]
    @GetMapping("/all-bookings")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings(); // [6]
        List<BookingResponse> bookingResponses = bookings.stream()
                .map(this::getBookingResponse) // [7]
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookingResponses); // [8]
    }

    // 3. Tìm đơn đặt phòng bằng mã xác nhận [9]
    @GetMapping("/confirmation/{confirmationCode}")
    public ResponseEntity<?> getBookingByConfirmationCode(@PathVariable String confirmationCode) { // [10]
        try {
            Booking booking = bookingService.getBookingByConfirmationCode(confirmationCode); // [11]
            return ResponseEntity.ok(getBookingResponse(booking)); // [12]
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // [13]
        }
    }

    // 4. Hủy/Xóa đơn đặt phòng [14]
    @DeleteMapping("/booking/{bookingId}/delete") // [15]
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long bookingId) {
        bookingService.cancelBooking(bookingId); // [14]
        return ResponseEntity.noContent().build();
    }

    /**
     * Hàm Helper: Chuyển đổi từ Entity Booking sang DTO BookingResponse [16], [17]
     */
    private BookingResponse getBookingResponse(Booking booking) {
        // Sử dụng NoArgsConstructor để tạo object rỗng
        BookingResponse response = new BookingResponse();

        // Dùng Setter để gán các giá trị cơ bản
        response.setId(booking.getId());
        response.setCheckIn(booking.getCheckIn());
        response.setCheckOut(booking.getCheckOut());
        response.setConfirmationCode(booking.getConfirmationCode());

        response.setGuestName(booking.getGuestName());
        response.setTotalGuests(booking.getTotalGuests());
        response.setTotalAmount(booking.getTotalAmount());

        // Gán danh sách phòng (Ánh xạ từ Entity BookingRoom sang DTO BookingRoomResponse)
        if (booking.getBookingRooms() != null) {
            List<BookingRoomResponse> bookedRooms = booking.getBookingRooms().stream()
                    .map(room -> new BookingRoomResponse(
                            room.getId(),
                            room.getRoom().getId(),
                            room.getRoom().getRoomNumber(),
                            room.getRoom().getRoomType().getName(),
                            room.getPriceAtBooking(),
                            room.getNumAdults(),
                            room.getNumChildren()
                    ))
                    .collect(Collectors.toList());
            response.setBookedRooms(bookedRooms);
        }

        return response;
    }

    // 5. Lấy lịch sử đặt phòng theo Email (Dành cho Profile)
    @GetMapping("/user/{email}/bookings")
    @PreAuthorize("hasRole('ROLE_ADMIN') or (hasRole('ROLE_USER') and #email == principal.username)")
    public ResponseEntity<?> getBookingsByUserEmail(@PathVariable String email) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUserEmail(email);

            // Chuyển đổi danh sách Booking Entity sang danh sách BookingResponse DTO
            List<BookingResponse> bookingResponses = bookings.stream()
                    .map(this::getBookingResponse) // Gọi lại hàm Helper bạn đã viết ở Controller
                    .collect(Collectors.toList());

            return ResponseEntity.ok(bookingResponses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tải lịch sử đặt phòng: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard/revenue")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(bookingService.getTotalRevenue());
    }

    @GetMapping("/dashboard/total-bookings")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Long> getTotalBookings() {
        return ResponseEntity.ok(bookingService.getTotalBookings());
    }
}
