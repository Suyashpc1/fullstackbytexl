const express = require("express");
const app = express();
const PORT = 3000;

// In-memory seat storage
let seats = {
  1: { status: "available" },
  2: { status: "available" },
  3: { status: "available" },
  4: { status: "available" },
  5: { status: "available" },
};

let seatLocks = {}; // track lock timeouts

// GET all seats
app.get("/seats", (req, res) => {
  res.json(seats);
});

// POST lock a seat
app.post("/lock/:id", (req, res) => {
  const seatId = req.params.id;

  if (!seats[seatId]) {
    return res.status(404).json({ message: "Seat not found" });
  }

  if (seats[seatId].status === "booked") {
    return res.status(400).json({ message: `Seat ${seatId} is already booked` });
  }

  if (seats[seatId].status === "locked") {
    return res.status(400).json({ message: `Seat ${seatId} is already locked` });
  }

  // Lock the seat
  seats[seatId].status = "locked";

  // Auto-unlock after 1 min
  if (seatLocks[seatId]) clearTimeout(seatLocks[seatId]);
  seatLocks[seatId] = setTimeout(() => {
    if (seats[seatId].status === "locked") {
      seats[seatId].status = "available";
      delete seatLocks[seatId];
    }
  }, 60000);

  res.json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

// POST confirm booking
app.post("/confirm/:id", (req, res) => {
  const seatId = req.params.id;

  if (!seats[seatId]) {
    return res.status(404).json({ message: "Seat not found" });
  }

  if (seats[seatId].status !== "locked") {
    return res.status(400).json({ message: `Seat ${seatId} is not locked and cannot be booked` });
  }

  // Confirm the booking
  seats[seatId].status = "booked";

  if (seatLocks[seatId]) {
    clearTimeout(seatLocks[seatId]);
    delete seatLocks[seatId];
  }

  res.json({ message: `Seat ${seatId} booked successfully!` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
