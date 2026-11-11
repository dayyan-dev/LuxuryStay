require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // Pehle menu items dekho
    const menuItems = await db.collection('menus').find({}).toArray();
    console.log('Menu items found:', menuItems.length);
    menuItems.forEach(m => console.log(` - ${m.name} | PKR ${m.price} | ${m._id}`));

    if (menuItems.length === 0) {
      console.log('Koi menu item nahi mila — pehle menu mein kuch items add karo!');
      process.exit(0);
    }

    // 2 test orders banao menu items se
    const item1 = menuItems[0];
    const item2 = menuItems[1] || menuItems[0];

    const orders = [
      {
        guestName: 'Ahmed Khan',
        roomNumber: '101',
        items: [
          { menuItemId: item1._id, name: item1.name, quantity: 2, price: item1.price },
          { menuItemId: item2._id, name: item2.name, quantity: 1, price: item2.price },
        ],
        totalAmount: (item1.price * 2) + (item2.price * 1),
        status: 'Pending',
        notes: 'Extra spicy please',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        guestName: 'Sara Malik',
        roomNumber: '205',
        items: [
          { menuItemId: item1._id, name: item1.name, quantity: 1, price: item1.price },
        ],
        totalAmount: item1.price * 1,
        status: 'Preparing',
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('restaurantorders').insertMany(orders);
    console.log('\n2 test orders insert ho gaye!');
    console.log(`Order 1: ${orders[0].guestName} — Room ${orders[0].roomNumber} — PKR ${orders[0].totalAmount} — ${orders[0].status}`);
    console.log(`Order 2: ${orders[1].guestName} — Room ${orders[1].roomNumber} — PKR ${orders[1].totalAmount} — ${orders[1].status}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();