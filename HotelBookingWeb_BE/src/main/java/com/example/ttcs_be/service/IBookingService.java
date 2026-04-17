package com.example.ttcs_be.service;

import com.example.ttcs_be.request.BookingRequest;
import com.example.ttcs_be.model.Booking;

import java.math.BigDecimal;
import java.util.List;

public interface IBookingService {

    // Nhận vào một Giỏ hàng (BookingRequest) và trả về mã xác nhận (Confirmation Code)
    String saveBooking(BookingRequest bookingRequest);

    List<Booking> getAllBookings();

    Booking getBookingByConfirmationCode(String confirmationCode);

    void cancelBooking(Long bookingId);

    List<Booking> getBookingsByUserEmail(String email);
    BigDecimal getTotalRevenue();
    long getTotalBookings();
}
