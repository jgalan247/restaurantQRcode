# Admin Dashboard Access

## System is Ready!

Your La Hacienda QR Code Ordering System is now fully set up and running.

## Admin Access Credentials

**Admin Login URL:** http://localhost:5173/admin/login

**Default Admin Credentials:**
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@lahacienda.co.uk

⚠️ **IMPORTANT:** Please change this password after your first login!

## Service URLs

- **Frontend (Customer App):** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Database:** localhost:5432

## Running Services

All Docker containers are running:
- ✅ Frontend (React/Vite) - Port 5173
- ✅ Backend (FastAPI) - Port 8000
- ✅ PostgreSQL Database - Port 5432

## What You Can Do Now

### As an Administrator:
1. **Login** to the admin dashboard at http://localhost:5173/admin/login
2. **Manage Menu** - Add, edit, or remove menu items
3. **View Orders** - Monitor and manage incoming orders in real-time
4. **Track Analytics** - View sales reports and customer insights
5. **Manage Specials** - Create daily specials and promotions
6. **Configure Offers** - Set up special offers and discounts
7. **Generate QR Codes** - Create table QR codes for customers

### As a Customer:
1. Scan a QR code (or visit http://localhost:5173)
2. Browse the menu
3. Add items to cart
4. Place an order
5. Complete payment (using test credentials)

## Next Steps

1. **Change Admin Password**
   - Login with the default credentials
   - Navigate to Settings or Profile
   - Update your password

2. **Customize Your Restaurant**
   - Update restaurant details
   - Upload your logo
   - Customize colors and branding

3. **Add Menu Items**
   - Navigate to Menu Management
   - Add categories and items
   - Upload food images
   - Set prices

4. **Test the System**
   - Place a test order as a customer
   - View it in the admin dashboard
   - Test the order workflow

## Test Payment Credentials

For development/testing with CityPay:
- Use the test credentials configured in `.env`
- Test card numbers will be provided by CityPay documentation

## Stopping the System

To stop all services:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

## Restarting the System

To start the system again:
```bash
docker-compose up -d
```

## Troubleshooting

If you encounter any issues:

1. **Check logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs postgres
   ```

2. **Restart services:**
   ```bash
   docker-compose restart
   ```

3. **Rebuild if needed:**
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## Database Access

If you need to access the database directly:
```bash
docker-compose exec postgres psql -U lahacienda -d lahacienda
```

## Support

For issues or questions, refer to the other documentation files:
- `GETTING_STARTED.md` - Complete setup guide
- `ADMIN_README.md` - Admin dashboard features
- `QUICK_REFERENCE.md` - Quick command reference

---

**Congratulations!** Your restaurant ordering system is ready to use! 🎉
