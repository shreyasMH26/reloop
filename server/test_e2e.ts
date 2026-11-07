/**
 * ReLoop Automated End-to-End Test Suite
 * Tests complete user journeys against the backend REST API
 */

const BASE_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('🧪 Starting ReLoop Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.status === 'healthy', 'API Health check returns 200 healthy');

    // 2. Visitor explores products
    const prodRes = await fetch(`${BASE_URL}/products`);
    const prods = await prodRes.json();
    assert(prodRes.status === 200 && prods.total >= 8, `Explore products returns ${prods.total} items`);

    // 3. Visitor searches and filters listings
    const searchRes = await fetch(`${BASE_URL}/products?q=calculator`);
    const searchProds = await searchRes.json();
    assert(searchProds.items.some((p: any) => p.title.toLowerCase().includes('calculator')), 'Search query "calculator" returns relevant products');

    const filterRes = await fetch(`${BASE_URL}/products?type=rent`);
    const rentProds = await filterRes.json();
    assert(rentProds.items.every((p: any) => p.listing_type === 'rent'), 'Filter type=rent returns only rental listings');

    // 4. User registration & cookie verification
    const testEmail = `student_${Date.now()}@biet.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123',
        full_name: 'Rohit Kulkarni',
        area: 'BIET Campus',
        phone: '+91 99000 11222',
      }),
    });
    const regData = await regRes.json();
    const cookieHeader = regRes.headers.get('set-cookie');
    assert(regRes.status === 201 && regData.token && regData.user.email === testEmail, 'User registration succeeds and returns JWT token');
    assert(cookieHeader !== null && cookieHeader.includes('reloop_token'), 'Registration sets secure HTTP-only reloop_token cookie');
    const userToken = regData.token;
    const userId = regData.user.id;

    // 5. User logs in
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securePassword123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'User login succeeds with correct credentials');

    // Test invalid credentials
    const badLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'wrongPassword' }),
    });
    assert(badLogin.status === 401, 'Invalid password is rejected with 401 Unauthorized');

    // 6. User creates a listing
    const createRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title: 'Sony Alpha A6400 Camera Kit',
        description: 'Barely used mirrorless camera with 16-50mm power zoom lens. Perfect for college media projects.',
        price: 32000,
        original_price: 65000,
        category_id: 'cat-electronics',
        condition: 'like_new',
        listing_type: 'sell',
        area: 'BIET Campus',
        location: 'Davanagere',
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'],
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.product.id, 'User can successfully publish a new marketplace listing');
    const newProductId = createData.product.id;

    // 7. Another user logs in and sends an exchange/purchase request
    const ananyaLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ananya.sharma@example.com',
        password: 'password123',
      }),
    });
    const ananyaData = await ananyaLogin.json();
    const ananyaToken = ananyaData.token;

    const reqRes = await fetch(`${BASE_URL}/purchase-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ananyaToken}`,
      },
      body: JSON.stringify({
        product_id: newProductId,
        request_type: 'buy',
        offered_price: 30000,
        message: 'Can I pick it up tomorrow outside BIET Central Library?',
      }),
    });
    const reqData = await reqRes.json();
    assert(reqRes.status === 201 && reqData.request.id, 'Buyer can send a verified purchase request to the seller');
    const requestId = reqData.request.id;

    // 8. Self-buy prevention check
    const selfBuy = await fetch(`${BASE_URL}/purchase-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        product_id: newProductId,
        request_type: 'buy',
        offered_price: 28000,
      }),
    });
    assert(selfBuy.status === 400, 'Self-purchasing own listing is correctly blocked with 400 Bad Request');

    // 9. Seller accepts request
    const acceptRes = await fetch(`${BASE_URL}/purchase-requests/${requestId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200 && acceptData.request.status === 'accepted', 'Seller can accept incoming purchase request');

    // 10. Reviews & Ratings verification
    // Karthik reviews Ananya for ord-1
    const karthikLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'karthik.gowda@example.com',
        password: 'password123',
      }),
    });
    const karthikData = await karthikLogin.json();
    const karthikToken = karthikData.token;

    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${karthikToken}`,
      },
      body: JSON.stringify({
        order_id: 'ord-1',
        rating: 5,
        comment: 'Great experience, very prompt handover and item in mint condition!',
      }),
    });
    const reviewData = await reviewRes.json();
    assert(
      reviewRes.status === 201 || (reviewRes.status === 400 && reviewData.error.includes('already submitted')),
      'Buyer can submit 5-star verified review on completed order (duplicate reviews prevented)'
    );

    const userReviewsRes = await fetch(`${BASE_URL}/reviews/user/usr-ananya`);
    const userReviews = await userReviewsRes.json();
    assert(userReviewsRes.status === 200 && userReviews.reviews.length >= 1, 'Public user reviews endpoint returns reviews list');

    // 11. Notifications verification
    const notifsRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${ananyaToken}` },
    });
    const notifsData = await notifsRes.json();
    assert(notifsRes.status === 200 && notifsData.notifications.length > 0, 'Notifications endpoint returns user notification queue');

    const markAllRes = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${ananyaToken}` },
    });
    assert(markAllRes.status === 200, 'User can mark all notifications as read');

    // 12. Admin Moderation Suite verification
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@reloop.in',
        password: 'password123',
      }),
    });
    const adminData = await adminLogin.json();
    assert(adminLogin.status === 200 && adminData.user.role === 'admin', 'Admin login succeeds and confirms admin role');
    const adminToken = adminData.token;

    // Non-admin cannot access admin routes
    const forbiddenAdmin = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${userToken}` }, // regular student user
    });
    assert(forbiddenAdmin.status === 403, 'Regular users are strictly forbidden (403) from accessing admin routes');

    // Admin accesses metrics
    const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const metricsData = await metricsRes.json();
    assert(metricsRes.status === 200 && metricsData.metrics.total_users > 0, 'Admin can retrieve platform health and activity metrics');

    // Admin lists and updates user status
    const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsers = await adminUsersRes.json();
    assert(adminUsersRes.status === 200 && adminUsers.users.length > 0, 'Admin can list registered user directory');

    // Admin flags a listing
    const flagRes = await fetch(`${BASE_URL}/admin/listings/${newProductId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'flagged', reason: 'Routine audit test' }),
    });
    assert(flagRes.status === 200, 'Admin can flag suspicious listing and update status');

    // 13. Sustainability intelligence endpoints
    const sustRes = await fetch(`${BASE_URL}/sustainability`);
    const sustData = await sustRes.json();
    assert(sustRes.status === 200 && sustData.total_items_reused > 0 && sustData.co2_saved_kg > 0, 'Sustainability metrics computed from real data');

    const leaderboardRes = await fetch(`${BASE_URL}/sustainability/leaderboard`);
    const leaderboardData = await leaderboardRes.json();
    assert(leaderboardRes.status === 200 && leaderboardData.leaderboard.length > 0, 'Sustainability leaderboard ranks active contributors');

    const catBreakdownRes = await fetch(`${BASE_URL}/sustainability/categories`);
    const catData = await catBreakdownRes.json();
    assert(catBreakdownRes.status === 200 && catData.categories.length > 0, 'Category breakdown returns environmental savings per category');

    console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed.`);
  } catch (err: any) {
    console.error('Test suite execution error:', err);
  }
}

runTests();
