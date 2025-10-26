"""
Seed script to populate collection centers
"""
from app import create_app
from app.extensions import db
from app.models.uploads import CollectionCenter

def seed_collection_centers():
    """Add sample collection centers for Nairobi"""
    
    centers = [
        {
            'name': 'Nairobi Central Recycling Hub',
            'address': 'CBD, Kenyatta Avenue, Nairobi',
            'latitude': -1.286389,
            'longitude': 36.817223,
            'phone': '+254712345678',
            'email': 'cbd@ecocollect.ke',
            'operating_hours': {
                'monday': '8:00-17:00',
                'tuesday': '8:00-17:00',
                'wednesday': '8:00-17:00',
                'thursday': '8:00-17:00',
                'friday': '8:00-17:00',
                'saturday': '9:00-13:00',
                'sunday': 'Closed'
            },
            'accepted_types': ['plastic', 'glass', 'metal', 'paper', 'e-waste']
        },
        {
            'name': 'Westlands Eco Center',
            'address': 'Westlands, Parklands Road, Nairobi',
            'latitude': -1.264259,
            'longitude': 36.808405,
            'phone': '+254722345679',
            'email': 'westlands@ecocollect.ke',
            'operating_hours': {
                'monday': '8:00-18:00',
                'tuesday': '8:00-18:00',
                'wednesday': '8:00-18:00',
                'thursday': '8:00-18:00',
                'friday': '8:00-18:00',
                'saturday': '8:00-16:00',
                'sunday': 'Closed'
            },
            'accepted_types': ['plastic', 'glass', 'metal', 'paper']
        },
        {
            'name': 'Karen Green Point',
            'address': 'Karen, Langata Road, Nairobi',
            'latitude': -1.319167,
            'longitude': 36.722084,
            'phone': '+254733456789',
            'email': 'karen@ecocollect.ke',
            'operating_hours': {
                'monday': '9:00-17:00',
                'tuesday': '9:00-17:00',
                'wednesday': '9:00-17:00',
                'thursday': '9:00-17:00',
                'friday': '9:00-17:00',
                'saturday': '9:00-14:00',
                'sunday': 'Closed'
            },
            'accepted_types': ['plastic', 'glass', 'metal', 'paper', 'organic']
        },
        {
            'name': 'Eastleigh Waste Hub',
            'address': 'Eastleigh, 1st Avenue, Nairobi',
            'latitude': -1.280010,
            'longitude': 36.839935,
            'phone': '+254744567890',
            'email': 'eastleigh@ecocollect.ke',
            'operating_hours': {
                'monday': '8:00-17:00',
                'tuesday': '8:00-17:00',
                'wednesday': '8:00-17:00',
                'thursday': '8:00-17:00',
                'friday': '8:00-17:00',
                'saturday': '8:00-13:00',
                'sunday': 'Closed'
            },
            'accepted_types': ['plastic', 'metal', 'e-waste']
        },
        {
            'name': 'Kilimani Recycling Station',
            'address': 'Kilimani, Argwings Kodhek Road, Nairobi',
            'latitude': -1.288969,
            'longitude': 36.788155,
            'phone': '+254755678901',
            'email': 'kilimani@ecocollect.ke',
            'operating_hours': {
                'monday': '8:00-17:00',
                'tuesday': '8:00-17:00',
                'wednesday': '8:00-17:00',
                'thursday': '8:00-17:00',
                'friday': '8:00-17:00',
                'saturday': '9:00-13:00',
                'sunday': 'Closed'
            },
            'accepted_types': ['plastic', 'glass', 'paper']
        }
    ]
    
    app = create_app()
    with app.app_context():
        # Check if centers already exist
        existing = CollectionCenter.query.count()
        
        if existing > 0:
            print(f"⚠️  Collection centers already exist ({existing} centers)")
            print("Skipping seed data. Delete existing centers first if you want to reseed.")
            return
        
        # Add all centers
        for center_data in centers:
            center = CollectionCenter(**center_data)
            db.session.add(center)
        
        db.session.commit()
        print(f"✅ Successfully added {len(centers)} collection centers!")
        
        # Print added centers
        for center in CollectionCenter.query.all():
            print(f"  - {center.name} ({center.address})")


if __name__ == '__main__':
    seed_collection_centers()
