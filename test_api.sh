#!/bin/bash
echo "1. Registering user..."
curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"password123"}' > /dev/null

echo "2. Logging in user..."
COOKIE=$(curl -s -i -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}' | grep -i Set-Cookie | awk '{print $2}')
echo "User Cookie: $COOKIE"

echo "3. Purchasing subscription..."
curl -s -X POST http://localhost:3000/api/user/subscribe -H "Content-Type: application/json" -H "Cookie: $COOKIE" -d '{"plan":"premium"}' | grep -o '"success":true'

echo "4. Checking Dashboard (User /me)..."
curl -s -X GET http://localhost:3000/api/user/me -H "Cookie: $COOKIE" | grep -o '"success":true'

echo "5. Logging in admin..."
ADMIN_COOKIE=$(curl -s -i -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d '{"password":"admin123"}' | grep -i Set-Cookie | awk '{print $2}')
echo "Admin Cookie: $ADMIN_COOKIE"

echo "6. Admin fetching keys..."
curl -s -X GET http://localhost:3000/api/admin/keys -H "Cookie: $ADMIN_COOKIE" | grep -o '"success":true'

echo "7. C Software verifying license..."
# First we need a valid key, let's just test if the endpoint returns valid JSON structure
curl -s -X GET "http://localhost:3000/api/get_api_keys?license_key=random_key&pc_build_number=12345" | grep -o '"success":false'
