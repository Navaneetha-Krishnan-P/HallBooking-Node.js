const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

let rooms = [];
let bookings = [];

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});



// Create a Room
app.post("/rooms", (req, res) => {
  const { numberOfSeats, amenities, pricePerHour } = req.body;
  const newRoom = {
    id: rooms.length + 1,
    numberOfSeats,
    amenities,
    pricePerHour,
    bookings: [],
  };
  rooms.push(newRoom);
  res.status(201).send(newRoom);
});



// Book a Room
app.post("/bookings", (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return res.status(404).send({ message: "Room not found" });
  }

  const isConflict = room.bookings.some(
    (booking) =>
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime))
  );

  if (isConflict) {
    return res
      .status(409)
      .send({ message: "Room is already booked for the given date and time" });
  }

  const newBooking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
  };

  room.bookings.push(newBooking);
  bookings.push(newBooking);
  res.status(201).send(newBooking);
});



// List all Rooms with Booked Data
app.get("/rooms", (req, res) => {
  const result = rooms.map((room) => ({
    roomName: room.id,
    bookedStatus: room.bookings.length > 0,
    bookings: room.bookings.map((booking) => ({
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    })),
  }));
  res.send(result);
});



// List all Customers with Booked Data
app.get("/customers", (req, res) => {
  const result = bookings.map((booking) => ({
    customerName: booking.customerName,
    roomName: booking.roomId,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  }));
  res.send(result);
});



// List how many times a customer has booked the room
app.get("/customer-bookings/:customerName", (req, res) => {
  const { customerName } = req.params;
  const customerBookings = bookings.filter(
    (booking) => booking.customerName === customerName
  );

  const result = customerBookings.map((booking) => ({
    customerName: booking.customerName,
    roomName: booking.roomId,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    bookingId: booking.id,
    bookingDate: booking.date,
    bookingStatus: "Confirmed",
  }));

  res.send(result);
});
