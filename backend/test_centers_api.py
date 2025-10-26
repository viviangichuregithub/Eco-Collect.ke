"""
Test script to verify centers endpoint
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_get_centers():
    """Test GET /api/centers"""
    print("\n📍 Testing GET /api/centers...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/centers")
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data['total']} collection centers")
            
            for center in data['centers']:
                print(f"\n  📌 {center['name']}")
                print(f"     Address: {center['address']}")
                print(f"     Phone: {center.get('phone', 'N/A')}")
                print(f"     Accepted Types: {', '.join(center.get('accepted_types', []))}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")


def test_get_nearby_centers():
    """Test GET /api/centers/nearby"""
    print("\n\n🗺️  Testing GET /api/centers/nearby...")
    
    # Nairobi CBD coordinates
    lat = -1.286389
    lng = 36.817223
    radius = 5  # 5km radius
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/centers/nearby",
            params={'lat': lat, 'lng': lng, 'radius': radius}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data['total']} centers within {radius}km")
            
            for center in data['centers']:
                print(f"\n  📌 {center['name']}")
                print(f"     Distance: {center['distance']} km")
                print(f"     Address: {center['address']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")


def test_search_centers():
    """Test GET /api/centers with search"""
    print("\n\n🔍 Testing GET /api/centers?search=Westlands...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/centers",
            params={'search': 'Westlands'}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data['total']} centers matching 'Westlands'")
            
            for center in data['centers']:
                print(f"\n  📌 {center['name']}")
                print(f"     Address: {center['address']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")


if __name__ == '__main__':
    print("=" * 60)
    print("Collection Centers API Test")
    print("=" * 60)
    
    test_get_centers()
    test_get_nearby_centers()
    test_search_centers()
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)
