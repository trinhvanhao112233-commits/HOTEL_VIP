package com.example.ttcs_be.service;

import com.example.ttcs_be.request.BookingRequest;
import com.example.ttcs_be.request.BookingRoomRequest;
import com.example.ttcs_be.exception.InvalidBookingRequestException;
import com.example.ttcs_be.exception.ResourceNotFoundException;
import com.example.ttcs_be.model.Booking;
import com.example.ttcs_be.model.BookingRoom;
import com.example.ttcs_be.model.Room;
import com.example.ttcs_be.repository.BookingRepository;
import com.example.ttcs_be.repository.RoomRepository;
import com.example.ttcs_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements IBookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public String saveBooking(BookingRequest bookingRequest) {
        // 1. Kiểm tra ngày hợp lệ cơ bản
        if (bookingRequest.getCheckOut().isBefore(bookingRequest.getCheckIn())) {
            throw new InvalidBookingRequestException("Ngày trả phòng phải diễn ra sau ngày nhận phòng!");
        }

        String confirmationCode = RandomStringUtils.randomNumeric(10);

        Booking booking = new Booking();
        // Set the user who is making the booking
        if (bookingRequest.getUserId() != null) {
            booking.setUser(userRepository.findById(bookingRequest.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + bookingRequest.getUserId())));
            booking.setGuestEmail(booking.getUser().getEmail());
        }

        booking.setCheckIn(bookingRequest.getCheckIn());
        booking.setCheckOut(bookingRequest.getCheckOut());
        booking.setGuestName(bookingRequest.getGuestName());
        booking.setConfirmationCode(confirmationCode);

        long numberOfNights = ChronoUnit.DAYS.between(bookingRequest.getCheckIn(), bookingRequest.getCheckOut());

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalGuests = 0;
        List<BookingRoom> bookingRooms = new ArrayList<>();

        // 2. Lấy danh sách TẤT CẢ các phòng đang trống trong khoảng thời gian này (Logic tối ưu của bạn)
        List<Room> availableRooms = roomRepository.findAvailableRoomsByDatesAndType(
                bookingRequest.getCheckIn(),
                bookingRequest.getCheckOut(),
                null // Bỏ qua phân loại, lấy tất cả phòng trống
        );

        // 3. Duyệt qua Giỏ hàng và Kiểm tra Overbooking
        for (BookingRoomRequest roomReq : bookingRequest.getSelectedRooms()) {

            // KIỂM TRA OVERBOOKING: Phòng khách chọn có nằm trong danh sách phòng trống không?
            boolean isRoomAvailable = availableRooms.stream()
                    .anyMatch(r -> r.getId().equals(roomReq.getRoomId()));

            if (!isRoomAvailable) {
                // Ném lỗi ngay lập tức, @Transactional sẽ rollback toàn bộ quá trình, không lưu gì cả
                throw new InvalidBookingRequestException("Rất tiếc! Phòng số ID " + roomReq.getRoomId() + " đã có người đặt trước trong khoảng thời gian này!");
            }

            // Nếu trống, tiếp tục tìm phòng để tính tiền
            Room room = roomRepository.findById(roomReq.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng với ID: " + roomReq.getRoomId()));

            int guestsInRoom = roomReq.getNumAdults() + roomReq.getNumChildren();
            totalGuests += guestsInRoom;

            BigDecimal roomPriceForStay = room.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(numberOfNights));
            totalAmount = totalAmount.add(roomPriceForStay);

            BookingRoom bookingRoom = new BookingRoom();
            bookingRoom.setRoom(room);
            bookingRoom.setBooking(booking);
            bookingRoom.setPriceAtBooking(room.getRoomType().getBasePrice());
            bookingRoom.setNumAdults(roomReq.getNumAdults());
            bookingRoom.setNumChildren(roomReq.getNumChildren());

            bookingRooms.add(bookingRoom);
        }

        // 4. Chốt đơn
        booking.setTotalAmount(totalAmount);
        booking.setTotalGuests(totalGuests);
        booking.setBookingRooms(bookingRooms); // Đã sửa tên biến theo đợt trước bạn chỉ ra

        bookingRepository.save(booking);

        return confirmationCode;
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingByConfirmationCode(String confirmationCode) {
        return bookingRepository.findByConfirmationCode(confirmationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn đặt phòng với mã: " + confirmationCode));
    }

    @Override
    public void cancelBooking(Long bookingId) {
        bookingRepository.deleteById(bookingId);
    }

    @Override
    public List<Booking> getBookingsByUserEmail(String email) {
        // Trả về danh sách đơn đặt phòng dựa trên email của khách
        return bookingRepository.findByUserEmail(email);
    }
    @Override
    public BigDecimal getTotalRevenue() {
        BigDecimal total = bookingRepository.calculateTotalRevenue();
        return total != null ? total : BigDecimal.ZERO; // Tránh lỗi null nếu chưa có đơn nào
    }

    @Override
    public long getTotalBookings() {
        return bookingRepository.countTotalBookings();
    }

    @Override
    public List<Object[]> getMonthlyStatistics() {
        return bookingRepository.getMonthlyStatistics();
    }

    @Override
    public List<Object[]> getRoomTypeStatistics() {
        return bookingRepository.getRoomTypeStatistics();
    }
}
