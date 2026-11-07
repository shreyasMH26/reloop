-- ============================================
-- ReLoop Database Schema
-- PostgreSQL / Supabase
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  area TEXT,
  rating NUMERIC(2,1) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO categories (id, name, slug, icon, description, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', '💻', 'Phones, laptops, cameras, audio and tech', 1),
  ('00000000-0000-0000-0000-000000000002', 'Furniture', 'furniture', '🪑', 'Desks, chairs, beds and room furniture', 2),
  ('00000000-0000-0000-0000-000000000003', 'Clothing', 'clothing', '👗', 'Apparel, winter wear, and college jackets', 3),
  ('00000000-0000-0000-0000-000000000004', 'Books', 'books', '📚', 'VTU engineering textbooks, novels and notes', 4),
  ('00000000-0000-0000-0000-000000000005', 'Sports', 'sports', '⚽', 'Cycles, gym gear, badminton and fitness', 5),
  ('00000000-0000-0000-0000-000000000006', 'Vehicles', 'vehicles', '🚲', 'Bicycles, scooters and vehicle gear', 6),
  ('00000000-0000-0000-0000-000000000007', 'Home & Garden', 'home-garden', '🏡', 'Appliances, kitchen essentials and decor', 7),
  ('00000000-0000-0000-0000-000000000008', 'Toys & Games', 'toys-games', '🎮', 'Gaming consoles, board games and collectibles', 8),
  ('00000000-0000-0000-0000-000000000009', 'Music', 'music', '🎵', 'Guitars, keyboards, microphones and gear', 9),
  ('00000000-0000-0000-0000-000000000010', 'Other', 'other', '📦', 'Tools, lab equipment and miscellaneous goods', 10)
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug, icon = EXCLUDED.icon;

-- ============================================
-- LISTINGS
-- ============================================
CREATE TABLE listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor', 'New', 'Like New', 'Good', 'Fair', 'Poor')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sell', 'rent', 'exchange')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'sold', 'rented', 'exchanged', 'inactive', 'pending_review')
  ),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Location (approximate only)
  location TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'Davanagere City',
  lat NUMERIC(10,6),
  lng NUMERIC(10,6),
  -- Rental specific
  rental_price_per_day NUMERIC(10,2),
  min_rental_days INTEGER DEFAULT 1,
  max_rental_days INTEGER,
  -- Exchange specific
  exchange_for TEXT,
  additional_payment NUMERIC(10,2) DEFAULT 0,
  -- Meta
  view_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_listing_type ON listings(listing_type);
CREATE INDEX idx_listings_area ON listings(area);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_search ON listings USING GIN(search_vector);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION listings_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.area, '') || ' ' ||
    COALESCE(NEW.location, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_search_vector_trigger
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION listings_search_vector_update();

-- ============================================
-- LISTING IMAGES
-- ============================================
CREATE TABLE listing_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON listing_images(listing_id, is_primary);

-- Only one primary image per listing
CREATE UNIQUE INDEX idx_listing_images_one_primary ON listing_images(listing_id)
  WHERE is_primary = TRUE;

-- ============================================
-- WISHLISTS
-- ============================================
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_listing_id ON wishlists(listing_id);

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  participant_1_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id, listing_id)
);

CREATE INDEX idx_conversations_participant_1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_participant_2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- RENTAL REQUESTS
-- ============================================
CREATE TABLE rental_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')
  ),
  message TEXT,
  owner_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rental_requests_listing_id ON rental_requests(listing_id);
CREATE INDEX idx_rental_requests_renter_id ON rental_requests(renter_id);
CREATE INDEX idx_rental_requests_owner_id ON rental_requests(owner_id);
CREATE INDEX idx_rental_requests_status ON rental_requests(status);

-- ============================================
-- EXCHANGE PROPOSALS
-- ============================================
CREATE TABLE exchange_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  proposer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  offered_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  offer_description TEXT NOT NULL,
  additional_payment NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')
  ),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exchange_proposals_listing_id ON exchange_proposals(listing_id);
CREATE INDEX idx_exchange_proposals_proposer_id ON exchange_proposals(proposer_id);
CREATE INDEX idx_exchange_proposals_owner_id ON exchange_proposals(owner_id);
CREATE INDEX idx_exchange_proposals_status ON exchange_proposals(status);

-- ============================================
-- TRANSACTION RECORDS
-- ============================================
CREATE TABLE transaction_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rental', 'exchange')),
  amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'completed',
  rental_request_id UUID REFERENCES rental_requests(id) ON DELETE SET NULL,
  exchange_proposal_id UUID REFERENCES exchange_proposals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_buyer ON transaction_records(buyer_id);
CREATE INDEX idx_transactions_seller ON transaction_records(seller_id);
CREATE INDEX idx_transactions_type ON transaction_records(transaction_type);
CREATE INDEX idx_transactions_created ON transaction_records(created_at DESC);

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'spam', 'misleading', 'prohibited_item', 'duplicate', 'fraud', 'inappropriate', 'other'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  ),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_listing_id ON reports(listing_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rental', 'exchange', 'message', 'system', 'transaction')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_requests_updated_at BEFORE UPDATE ON rental_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_proposals_updated_at BEFORE UPDATE ON exchange_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Listings RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (status IN ('active', 'sold', 'rented', 'exchanged') OR
         seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all listings"
  ON listings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Listing Images RLS
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing images are publicly viewable"
  ON listing_images FOR SELECT USING (true);

CREATE POLICY "Sellers can manage their listing images"
  ON listing_images FOR ALL
  USING (listing_id IN (
    SELECT id FROM listings WHERE seller_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Wishlists RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own wishlist"
  ON wishlists FOR ALL USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Conversations RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT USING (
    participant_1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant_2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT WITH CHECK (
    participant_1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant_2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE USING (
    participant_1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    participant_2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR participant_2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR participant_2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON messages FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE participant_1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR participant_2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Rental Requests RLS
ALTER TABLE rental_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rental requests"
  ON rental_requests FOR SELECT USING (
    renter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Renters can create rental requests"
  ON rental_requests FOR INSERT WITH CHECK (
    renter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners and renters can update rental status"
  ON rental_requests FOR UPDATE USING (
    renter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Exchange Proposals RLS
ALTER TABLE exchange_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exchange proposals"
  ON exchange_proposals FOR SELECT USING (
    proposer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create exchange proposals"
  ON exchange_proposals FOR INSERT WITH CHECK (
    proposer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners and proposers can update status"
  ON exchange_proposals FOR UPDATE USING (
    proposer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Reports RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit reports"
  ON reports FOR INSERT WITH CHECK (
    reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT USING (
    reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all reports"
  ON reports FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (
    user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- Transaction Records RLS
ALTER TABLE transaction_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transaction_records FOR SELECT USING (
    buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    seller_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all transactions"
  ON transaction_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- ENABLE REALTIME FOR MESSAGING
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Listings with primary image
CREATE VIEW listings_with_primary_image AS
SELECT
  l.*,
  li.url AS primary_image_url
FROM listings l
LEFT JOIN listing_images li ON li.listing_id = l.id AND li.is_primary = TRUE;

-- Platform sustainability stats
CREATE VIEW sustainability_stats AS
SELECT
  (SELECT COUNT(*) FROM transaction_records WHERE transaction_type = 'sale') AS total_sales,
  (SELECT COUNT(*) FROM transaction_records WHERE transaction_type = 'exchange') AS total_exchanges,
  (SELECT COUNT(*) FROM transaction_records WHERE transaction_type = 'rental') AS total_rentals,
  (
    (SELECT COUNT(*) FROM transaction_records WHERE transaction_type = 'sale') +
    (SELECT COUNT(*) FROM transaction_records WHERE transaction_type = 'exchange') +
    (SELECT COUNT(*) FROM transaction_records WHERE transaction_type = 'rental')
  ) AS total_items_reused,
  (SELECT COUNT(*) FROM profiles WHERE is_suspended = FALSE) AS total_users,
  (SELECT COUNT(*) FROM listings WHERE status = 'active') AS active_listings;
