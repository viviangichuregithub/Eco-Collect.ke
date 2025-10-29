"""
Collection Centers routes for managing waste collection centers
"""
from flask import Blueprint, request, jsonify
from app.models.uploads import CollectionCenter
from app.extensions import db
import math

centers_bp = Blueprint('centers', __name__)


@centers_bp.route('', methods=['GET'])
def get_collection_centers():
    """
    Get all active collection centers
    ---
    tags:
      - Centers
    parameters:
      - in: query
        name: search
        type: string
        description: Search term to filter centers by name or address
      - in: query
        name: type
        type: string
        description: Filter centers by accepted waste type
      - in: query
        name: active
        type: boolean
        description: Whether to include only active centers (default: true)
    responses:
      200:
        description: A list of collection centers
        schema:
          type: object
          properties:
            centers:
              type: array
              items:
                type: object
            total:
              type: integer
      500:
        description: Server error
    """
    try:
        # Query parameters
        search = request.args.get('search', '').strip()
        accepted_type = request.args.get('type')
        is_active = request.args.get('active', 'true').lower() == 'true'

        # Build query
        query = CollectionCenter.query.filter_by(is_active=is_active)

        # Search by name or address
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                db.or_(
                    CollectionCenter.name.ilike(search_pattern),
                    CollectionCenter.address.ilike(search_pattern)
                )
            )

        # Filter by accepted waste type
        if accepted_type:
            # JSON containment query for accepted_types array
            query = query.filter(
                CollectionCenter.accepted_types.contains([accepted_type])
            )

        # Get all matching centers
        centers = query.order_by(CollectionCenter.name).all()

        # Convert to dict
        centers_data = [center.to_dict() for center in centers]

        return jsonify({
            'centers': centers_data,
            'total': len(centers_data)
        }), 200

    except Exception as e:
        print(f"Get centers error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to retrieve collection centers'}), 500



@centers_bp.route('/<int:center_id>', methods=['GET'])
def get_center_by_id(center_id):
    """
    Get detailed information about a specific collection center
    ---
    tags:
        - Centers
    parameters:
        - in: path
            name: center_id
            required: true
            type: integer
            description: ID of the collection center
    responses:
        200:
            description: Center details
            schema:
                type: object
        404:
            description: Center not found
        500:
            description: Server error
    """
    try:
        center = CollectionCenter.query.get(center_id)
        
        if not center:
            return jsonify({'error': 'Collection center not found'}), 404
        
        return jsonify(center.to_dict()), 200
        
    except Exception as e:
        print(f"Get center error: {str(e)}")
        return jsonify({'error': 'Failed to retrieve collection center'}), 500



@centers_bp.route('/nearby', methods=['GET'])
def get_nearby_centers():
    """
    Get collection centers near a specific location
    ---
    tags:
        - Centers
    parameters:
        - in: query
            name: lat
            required: true
            type: number
            description: Latitude of search location
        - in: query
            name: lng
            required: true
            type: number
            description: Longitude of search location
        - in: query
            name: radius
            type: number
            description: Search radius in kilometers (default 10)
    responses:
        200:
            description: Nearby centers
            schema:
                type: object
        400:
            description: Missing parameters
        500:
            description: Server error
    """
    try:
        latitude = request.args.get('lat', type=float)
        longitude = request.args.get('lng', type=float)
        radius = request.args.get('radius', 10, type=float)
        
        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Get all active centers
        centers = CollectionCenter.query.filter_by(is_active=True).all()
        
        # Calculate distance and filter
        nearby_centers = []
        for center in centers:
            if center.latitude and center.longitude:
                distance = calculate_distance(
                    latitude, longitude,
                    center.latitude, center.longitude
                )
                
                if distance <= radius:
                    center_dict = center.to_dict()
                    center_dict['distance'] = round(distance, 2)  # Distance in km
                    nearby_centers.append(center_dict)
        
        # Sort by distance
        nearby_centers.sort(key=lambda x: x['distance'])
        
        return jsonify({
            'centers': nearby_centers,
            'total': len(nearby_centers),
            'search_radius': radius,
            'location': {
                'latitude': latitude,
                'longitude': longitude
            }
        }), 200
        
    except Exception as e:
        print(f"Get nearby centers error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to find nearby centers'}), 500



@centers_bp.route('', methods=['POST'])
def create_center():
    """
    Create a new collection center (admin only)
    ---
    tags:
        - Centers
    parameters:
        - in: body
            name: body
            required: true
            schema:
                type: object
                required:
                    - name
                    - address
                properties:
                    name:
                        type: string
                    address:
                        type: string
                    latitude:
                        type: number
                    longitude:
                        type: number
                    phone:
                        type: string
                    email:
                        type: string
                    accepted_types:
                        type: array
                        items:
                            type: string
    responses:
        201:
            description: Created
        400:
            description: Validation error
        500:
            description: Server error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'address']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new center
        center = CollectionCenter(
            name=data['name'],
            address=data['address'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            phone=data.get('phone'),
            email=data.get('email'),
            operating_hours=data.get('operating_hours'),
            accepted_types=data.get('accepted_types', []),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(center)
        db.session.commit()
        
        return jsonify({
            'message': 'Collection center created successfully',
            'center': center.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Create center error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create collection center'}), 500



@centers_bp.route('/<int:center_id>', methods=['PATCH'])
def update_center(center_id):
    """
    Update a collection center (admin only)
    """
    try:
        center = CollectionCenter.query.get(center_id)
        
        if not center:
            return jsonify({'error': 'Collection center not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            center.name = data['name']
        if 'address' in data:
            center.address = data['address']
        if 'latitude' in data:
            center.latitude = data['latitude']
        if 'longitude' in data:
            center.longitude = data['longitude']
        if 'phone' in data:
            center.phone = data['phone']
        if 'email' in data:
            center.email = data['email']
        if 'operating_hours' in data:
            center.operating_hours = data['operating_hours']
        if 'accepted_types' in data:
            center.accepted_types = data['accepted_types']
        if 'is_active' in data:
            center.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Collection center updated successfully',
            'center': center.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Update center error: {str(e)}")
        return jsonify({'error': 'Failed to update collection center'}), 500



@centers_bp.route('/<int:center_id>', methods=['DELETE'])
def delete_center(center_id):
    """
    Deactivate a collection center (soft delete)
    """
    try:
        center = CollectionCenter.query.get(center_id)
        
        if not center:
            return jsonify({'error': 'Collection center not found'}), 404
        
        # Soft delete by marking as inactive
        center.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'Collection center deactivated successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Delete center error: {str(e)}")
        return jsonify({'error': 'Failed to deactivate collection center'}), 500


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

