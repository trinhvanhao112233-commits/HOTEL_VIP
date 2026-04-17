package com.example.ttcs_be.repository;

import com.example.ttcs_be.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Tìm đơn đặt phòng bằng mã xác nhận
    Optional<Booking> findByConfirmationCode(String confirmationCode);

    // Tìm lịch sử đặt phòng dựa trên ID của User
    List<Booking> findByUserId(Long userId);
    List<Booking> findByUserEmail(String email);

    // Tính tổng doanh thu từ tất cả các đơn đặt phòng
    @Query("SELECT SUM(b.totalAmount) FROM Booking b")
    BigDecimal calculateTotalRevenue();

    // Đếm tổng số lượng đơn đặt phòng
    @Query("SELECT COUNT(b) FROM Booking b")
    long countTotalBookings();
}
