"""
Seed script — Indian dummy data for ApnaSewa
Run: python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timezone, timedelta
import random
from app.db.session import SessionLocal
from app.db.base import Base
from app.db.session import engine
from app.models.user import User, UserRole, UserStatus
from app.models.service import ServiceCategory, Service
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.core.security import hash_password

# ─── Create tables if missing ───────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

db = SessionLocal()


def clear_existing():
    print("🗑  Clearing existing seed data…")
    db.query(Review).delete()
    db.query(Booking).delete()
    db.query(Service).delete()
    db.query(ServiceCategory).delete()
    db.query(User).delete()
    db.commit()


# ─── Categories ─────────────────────────────────────────────────────────────
CATEGORIES = [
    {"name": "Carpenter",    "description": "Furniture repair, custom woodwork & fitting"},
    {"name": "Plumbing",     "description": "Pipe repairs, leakage fixes & bathroom fitting"},
    {"name": "Electrician",  "description": "Wiring, MCB, fan & appliance repair"},
    {"name": "Mechanic",     "description": "Two-wheeler & four-wheeler repair at doorstep"},
    {"name": "Cleaning",     "description": "Home deep cleaning, sofa & carpet cleaning"},
    {"name": "Painter",      "description": "Interior & exterior wall painting"},
    {"name": "AC Repair",    "description": "AC service, gas refill & installation"},
    {"name": "Pest Control", "description": "Cockroach, termite & rodent control"},
]

# ─── Services per category ───────────────────────────────────────────────────
SERVICES = {
    "Carpenter": [
        {"name": "Furniture Assembly",         "price": 399,  "duration_minutes": 60,  "description": "Assemble flat-pack or new furniture — beds, wardrobes, study tables"},
        {"name": "Door / Window Repair",       "price": 299,  "duration_minutes": 45,  "description": "Fix jammed doors, broken hinges, or cracked window frames"},
        {"name": "Custom Shelf Installation",  "price": 599,  "duration_minutes": 90,  "description": "Wall-mount wooden shelves with polish finish"},
        {"name": "Wooden Flooring Repair",     "price": 799,  "duration_minutes": 120, "description": "Fix squeaky or damaged hardwood / laminate flooring"},
    ],
    "Plumbing": [
        {"name": "Tap / Faucet Repair",        "price": 199,  "duration_minutes": 30,  "description": "Fix dripping taps, change washers or replace the faucet"},
        {"name": "Toilet Flush Repair",        "price": 249,  "duration_minutes": 40,  "description": "Repair or replace flush valve, cistern parts"},
        {"name": "Pipe Leak Fix",              "price": 349,  "duration_minutes": 60,  "description": "Seal or replace leaking water supply / drain pipes"},
        {"name": "Bathroom Fitting",           "price": 999,  "duration_minutes": 180, "description": "Full bathroom fixture installation — shower, basin, commode"},
        {"name": "Water Heater Installation",  "price": 699,  "duration_minutes": 90,  "description": "Install or replace geyser / water heater"},
    ],
    "Electrician": [
        {"name": "Fan Installation / Repair",  "price": 249,  "duration_minutes": 40,  "description": "Ceiling or exhaust fan fitting, capacitor & regulator fix"},
        {"name": "Switchboard Repair",         "price": 199,  "duration_minutes": 30,  "description": "Replace broken switches, sockets or MCB trip fix"},
        {"name": "Full Home Wiring",           "price": 2499, "duration_minutes": 300, "description": "End-to-end electrical wiring for new or renovation projects"},
        {"name": "Inverter / UPS Repair",      "price": 499,  "duration_minutes": 60,  "description": "Battery check, inverter board repair & replacement"},
        {"name": "CCTV Installation",          "price": 1499, "duration_minutes": 180, "description": "Install up to 4 CCTV cameras with DVR setup"},
    ],
    "Mechanic": [
        {"name": "Bike Basic Service",         "price": 599,  "duration_minutes": 90,  "description": "Engine oil change, filter clean, chain lube & basic check"},
        {"name": "Bike Tyre Puncture",         "price": 149,  "duration_minutes": 30,  "description": "On-site tubeless or tube tyre puncture repair"},
        {"name": "Car Battery Replacement",    "price": 299,  "duration_minutes": 30,  "description": "Check battery health & replace if needed (battery cost extra)"},
        {"name": "Car AC Gas Refill",          "price": 999,  "duration_minutes": 60,  "description": "Recharge car AC refrigerant, check for leaks"},
        {"name": "Car Denting & Painting",     "price": 1999, "duration_minutes": 240, "description": "Minor dent removal & spot painting for small panels"},
    ],
    "Cleaning": [
        {"name": "2BHK Deep Cleaning",         "price": 1299, "duration_minutes": 240, "description": "Full kitchen, bathroom & room scrub — includes appliances"},
        {"name": "Sofa Cleaning (3-seater)",   "price": 799,  "duration_minutes": 120, "description": "Steam cleaning & stain removal for fabric / leather sofa"},
        {"name": "Carpet / Rug Cleaning",      "price": 499,  "duration_minutes": 90,  "description": "Shampoo wash + dry for carpet up to 6×4 ft"},
        {"name": "Kitchen Deep Clean",         "price": 699,  "duration_minutes": 120, "description": "Degrease chimney, oven, tiles & slab with eco-products"},
    ],
    "Painter": [
        {"name": "1 Room Interior Paint",      "price": 2499, "duration_minutes": 480, "description": "2 coats premium emulsion, prep & finishing included"},
        {"name": "Full Flat Painting (2BHK)",  "price": 8999, "duration_minutes": 960, "description": "Full interior 2BHK with Asian/Dulux paints, labour included"},
        {"name": "Waterproofing (Terrace)",    "price": 3499, "duration_minutes": 360, "description": "Terrace waterproof coating — up to 500 sq ft"},
    ],
    "AC Repair": [
        {"name": "AC Service (1–1.5 Ton)",     "price": 699,  "duration_minutes": 90,  "description": "Filter clean, coil wash, gas check & performance test"},
        {"name": "AC Gas Refill",              "price": 1299, "duration_minutes": 60,  "description": "R22 / R32 refrigerant top-up with leak test"},
        {"name": "AC Installation",            "price": 999,  "duration_minutes": 120, "description": "Split AC indoor + outdoor unit wall mounting & piping"},
    ],
    "Pest Control": [
        {"name": "Cockroach Treatment",        "price": 499,  "duration_minutes": 60,  "description": "Gel-based treatment for 1–2BHK, safe for kids & pets"},
        {"name": "Termite Control",            "price": 1499, "duration_minutes": 120, "description": "Chemical soil treatment & wood spray — 1-year warranty"},
        {"name": "Full Home Pest Control",     "price": 1999, "duration_minutes": 180, "description": "Covers all pests: cockroach, ant, lizard, rodent & mosquito"},
    ],
}

# ─── Providers (service professionals) ──────────────────────────────────────
PROVIDERS = [
    # Carpenters
    {"full_name": "Ramesh Vishwakarma",  "phone": "9811001001", "city": "Delhi",     "specialty": "Carpenter"},
    {"full_name": "Suresh Suthar",       "phone": "9822002002", "city": "Mumbai",    "specialty": "Carpenter"},
    # Plumbers
    {"full_name": "Mohan Plumber",       "phone": "9833003003", "city": "Pune",      "specialty": "Plumbing"},
    {"full_name": "Kishan Nalkari",      "phone": "9844004004", "city": "Delhi",     "specialty": "Plumbing"},
    # Electricians
    {"full_name": "Vijay Bijliwala",     "phone": "9855005005", "city": "Mumbai",    "specialty": "Electrician"},
    {"full_name": "Deepak Electrician",  "phone": "9866006006", "city": "Bangalore", "specialty": "Electrician"},
    # Mechanics
    {"full_name": "Ajay Mistri",         "phone": "9877007007", "city": "Pune",      "specialty": "Mechanic"},
    {"full_name": "Raju Mistry",         "phone": "9888008008", "city": "Delhi",     "specialty": "Mechanic"},
    # Cleaning
    {"full_name": "Sunita Bai",          "phone": "9899009009", "city": "Mumbai",    "specialty": "Cleaning"},
    {"full_name": "Kavita Safai",        "phone": "9900010010", "city": "Bangalore", "specialty": "Cleaning"},
    # Painter
    {"full_name": "Prakash Rangwala",    "phone": "9711011011", "city": "Delhi",     "specialty": "Painter"},
    # AC Repair
    {"full_name": "Salim AC Tech",       "phone": "9722012012", "city": "Mumbai",    "specialty": "AC Repair"},
    # Pest Control
    {"full_name": "Bunty Pest Pro",      "phone": "9733013013", "city": "Pune",      "specialty": "Pest Control"},
]

# ─── Customers ───────────────────────────────────────────────────────────────
CUSTOMERS = [
    {"full_name": "Priya Sharma",       "phone": "9001001001", "city": "Mumbai",    "email": "priya.sharma@gmail.com"},
    {"full_name": "Ankit Verma",        "phone": "9002002002", "city": "Delhi",     "email": "ankit.verma@gmail.com"},
    {"full_name": "Sneha Iyer",         "phone": "9003003003", "city": "Bangalore", "email": "sneha.iyer@gmail.com"},
    {"full_name": "Rahul Gupta",        "phone": "9004004004", "city": "Pune",      "email": "rahul.gupta@gmail.com"},
    {"full_name": "Pooja Patel",        "phone": "9005005005", "city": "Mumbai",    "email": "pooja.patel@gmail.com"},
    {"full_name": "Arjun Singh",        "phone": "9006006006", "city": "Delhi",     "email": "arjun.singh@gmail.com"},
    {"full_name": "Meena Nair",         "phone": "9007007007", "city": "Bangalore", "email": "meena.nair@gmail.com"},
    {"full_name": "Vikram Chauhan",     "phone": "9008008008", "city": "Pune",      "email": "vikram.chauhan@gmail.com"},
]

ADDRESSES = [
    "102, Shivaji Nagar, Mumbai – 400016",
    "45, Lajpat Nagar, New Delhi – 110024",
    "78, Koramangala 5th Block, Bangalore – 560095",
    "23, Kothrud, Pune – 411038",
    "12, Andheri West, Mumbai – 400058",
    "88, Rohini Sector 8, New Delhi – 110085",
    "55, Indiranagar, Bangalore – 560038",
    "31, Baner Road, Pune – 411045",
]

REVIEW_COMMENTS = {
    5: [
        "Bahut badhiya kaam kiya! Bilkul time pe aaye aur kaam ekdum perfect.",
        "Excellent service! Provider was very professional and polite. Highly recommended.",
        "Ek number kaam! Ghar bilkul saaf ho gaya. Dobara zaroor bulaunga.",
        "Very satisfied with the work. Reasonable price and quality output. 5 stars easily!",
        "Ramesh ji ne bahut achha kaam kiya. Furniture bilkul tight ho gaya. Thank you!",
    ],
    4: [
        "Good work overall. Minor delay but the quality was very good.",
        "Kaam theek tha, lekin thoda time zyada liya. Otherwise happy with the result.",
        "Professional service. Cleaned up after the job which I really appreciated.",
        "Quality was good, pricing is fair. Will use again.",
    ],
    3: [
        "Average experience. The work was done but needed some follow-up corrections.",
        "Theek theek kaam tha. Price thoda zyada lagi but okay.",
        "Decent service but could be better. On time but did not bring all tools.",
    ],
    2: [
        "Not very happy. Had to ask multiple times to redo the finishing.",
        "Kaam mein thodi gadbad thi. Had to call again to fix it.",
    ],
}


def seed():
    clear_existing()

    # ── Categories ──────────────────────────────────────────────────────────
    print("📂 Seeding categories…")
    cat_map = {}
    for c in CATEGORIES:
        cat = ServiceCategory(**c)
        db.add(cat)
        db.flush()
        cat_map[c["name"]] = cat

    # ── Services ────────────────────────────────────────────────────────────
    print("🔧 Seeding services…")
    svc_map: dict[str, list[Service]] = {}
    for cat_name, svcs in SERVICES.items():
        svc_map[cat_name] = []
        for s in svcs:
            svc = Service(category_id=cat_map[cat_name].id, **s)
            db.add(svc)
            db.flush()
            svc_map[cat_name].append(svc)

    # ── Providers ───────────────────────────────────────────────────────────
    print("👷 Seeding providers…")
    provider_map: dict[str, list[User]] = {}
    for p in PROVIDERS:
        specialty = p.pop("specialty")
        user = User(
            role=UserRole.PROVIDER,
            status=UserStatus.ACTIVE,
            is_verified=True,
            is_phone_verified=True,
            hashed_password=hash_password("Provider@123"),
            pincode="400001",
            **p,
        )
        db.add(user)
        db.flush()
        provider_map.setdefault(specialty, []).append(user)

    # ── Customers ───────────────────────────────────────────────────────────
    print("🧑 Seeding customers…")
    customers = []
    for c in CUSTOMERS:
        user = User(
            role=UserRole.CUSTOMER,
            status=UserStatus.ACTIVE,
            is_verified=True,
            is_phone_verified=True,
            hashed_password=hash_password("Customer@123"),
            address=random.choice(ADDRESSES),
            pincode="400001",
            **c,
        )
        db.add(user)
        db.flush()
        customers.append(user)

    # ── Bookings + Reviews ──────────────────────────────────────────────────
    print("📅 Seeding bookings & reviews…")
    booking_count = 0
    review_count  = 0

    now = datetime.now(timezone.utc)
    statuses_completed = [BookingStatus.COMPLETED] * 6 + [BookingStatus.CONFIRMED] * 2 + [BookingStatus.CANCELLED]

    for cat_name, services_list in svc_map.items():
        providers = provider_map.get(cat_name, [])
        if not providers:
            continue

        for i, service in enumerate(services_list):
            # Create 3-5 bookings per service
            num_bookings = random.randint(3, 5)
            for j in range(num_bookings):
                customer  = random.choice(customers)
                provider  = random.choice(providers)
                status    = random.choice(statuses_completed)
                days_ago  = random.randint(1, 90)
                scheduled = now - timedelta(days=days_ago, hours=random.randint(0, 8))

                booking = Booking(
                    customer_id=customer.id,
                    provider_id=provider.id,
                    service_id=service.id,
                    status=status,
                    scheduled_at=scheduled,
                    address=random.choice(ADDRESSES),
                    total_amount=service.price,
                    notes=random.choice([
                        None,
                        "Please bring all necessary tools.",
                        "Call before coming.",
                        "2nd floor, no lift.",
                        "Prefer morning slot if possible.",
                        "Kaam jaldi karna hai.",
                    ]),
                    created_at=scheduled - timedelta(hours=random.randint(1, 48)),
                )
                db.add(booking)
                db.flush()
                booking_count += 1

                # Add review only for completed bookings
                if status == BookingStatus.COMPLETED:
                    rating = random.choices([5, 4, 3, 2], weights=[55, 25, 15, 5])[0]
                    comment = random.choice(REVIEW_COMMENTS[rating])
                    review = Review(
                        booking_id=booking.id,
                        customer_id=customer.id,
                        provider_id=provider.id,
                        rating=rating,
                        comment=comment,
                        created_at=scheduled + timedelta(hours=random.randint(1, 24)),
                    )
                    db.add(review)
                    db.flush()
                    review_count += 1

    db.commit()
    print(f"\n✅ Seed complete!")
    print(f"   Categories : {len(CATEGORIES)}")
    print(f"   Services   : {sum(len(v) for v in SERVICES.values())}")
    print(f"   Providers  : {len(PROVIDERS)}")
    print(f"   Customers  : {len(CUSTOMERS)}")
    print(f"   Bookings   : {booking_count}")
    print(f"   Reviews    : {review_count}")
    print("\n🔑 Login credentials:")
    print("   Customers → phone: 9001001001–9008008008  password: Customer@123")
    print("   Providers → phone: 9811001001–9733013013  password: Provider@123")


if __name__ == "__main__":
    seed()
    db.close()
