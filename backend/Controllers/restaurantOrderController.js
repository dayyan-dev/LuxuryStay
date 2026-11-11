const RestaurantOrder = require('../Models/RestaurantOrder');
const Room = require('../Models/Room');
const Booking = require('../Models/Booking');

const createOrder = async (req, res) => {
  try {
    const {
      guestName,
      roomNumber,
      item,
      items,
      quantity = 1,
      notes,
      total,
      totalAmount,
    } = req.body;

    const cleanedRoom = String(roomNumber || '').trim();
    if (!cleanedRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number is required for in-room dining orders.',
      });
    }

    // Resolve room by number (accept "301", "Room 301", etc.)
    const numericRoom = cleanedRoom.replace(/[^0-9]/g, '');
    const roomDoc = await Room.findOne({
      $or: [
        { roomNumber: cleanedRoom },
        ...(numericRoom ? [{ roomNumber: numericRoom }] : []),
      ],
    });
    if (!roomDoc) {
      return res.status(400).json({
        success: false,
        message: `Room "${cleanedRoom}" was not found. Enter your assigned room number.`,
      });
    }

    const userId = req.body.userId || req.user?._id || null;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to place an in-room dining order.',
      });
    }

    // Guest must have an active checked-in stay for that room
    const activeStay = await Booking.findOne({
      userId,
      roomId: roomDoc._id,
      bookingStatus: 'checked_in',
    });
    if (!activeStay) {
      return res.status(400).json({
        success: false,
        message:
          'In-room dining is available only for guests currently checked in to this room.',
      });
    }

    // Normalize items array
    let orderItems = [];
    if (Array.isArray(items) && items.length > 0) {
      orderItems = items.map((it) => ({
        menuItemId: it.menuItemId || it._id || null,
        name: it.name,
        quantity: Number(it.quantity) || 1,
        price: Number(it.price) || 0,
      }));
    } else if (item) {
      orderItems = [
        {
          menuItemId: item._id || item.menuItemId || null,
          name: item.name,
          quantity: Number(quantity) || 1,
          price: Number(item.price) || 0,
        },
      ];
    }

    if (!orderItems.length) {
      return res.status(400).json({ success: false, message: 'Order items are required.' });
    }

    // Ensure totalAmount is computed reliably
    const computedTotal =
      Number(totalAmount) ||
      Number(total) ||
      orderItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);

    const order = await RestaurantOrder.create({
      userId,
      guestName: guestName || req.user?.name || "Guest",
      roomNumber: roomDoc.roomNumber,
      items: orderItems,
      totalAmount: computedTotal,
      notes: notes || "",
      status: "Pending",
    });

    const populated = await RestaurantOrder.findById(order._id).populate('userId', 'name email phone');
    res.status(201).json({ success: true, message: 'Order placed successfully', data: populated });
  } catch (error) {
    console.error("Restaurant order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await RestaurantOrder.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ORDER_FLOW = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered'];

const updateOrderStatus = async (req, res) => {
  try {
    const nextStatus = req.body.status;
    if (!nextStatus) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const order = await RestaurantOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const current = order.status;

    if (nextStatus === current) {
      const populated = await order.populate('userId', 'name email phone');
      return res.status(200).json({ success: true, message: 'Order updated', data: populated });
    }

    if (nextStatus === 'Cancelled') {
      if (['Delivered', 'Cancelled'].includes(current)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an order that is already ${current}`,
        });
      }
    } else {
      const curIdx = ORDER_FLOW.indexOf(current);
      const nextIdx = ORDER_FLOW.indexOf(nextStatus);
      if (curIdx === -1 || nextIdx === -1 || nextIdx !== curIdx + 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid status change: ${current} → ${nextStatus}. Move forward one step only.`,
        });
      }
    }

    order.status = nextStatus;
    await order.save();
    const populated = await order.populate('userId', 'name email phone');
    res.status(200).json({ success: true, message: 'Order updated', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await RestaurantOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await RestaurantOrder.find({ userId })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { createOrder, getOrders, updateOrderStatus, deleteOrder,getOrdersByUserId };
