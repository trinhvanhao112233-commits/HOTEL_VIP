package com.example.ttcs_be.service;

import com.example.ttcs_be.model.RoomType;
import java.util.List;

public interface IRoomTypeService {

    RoomType addRoomType(RoomType roomTypeRequest);

    List<RoomType> getAllRoomTypes();

    RoomType getRoomTypeById(Long id);

    RoomType updateRoomType(Long id, RoomType roomTypeRequest);

    void deleteRoomType(Long id);
}
