import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { toast } from "react-toastify";

// Fix for Leaflet default icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const userIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const placeIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper: Haversine Distance Calculation (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// Component to handle map movement
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 9); // Zoomed out for 100km context
        }
    }, [center, map]);
    return null;
}

const NearbyServices = () => {
    const [center, setCenter] = useState([40.7128, -74.0060]); // Default NY
    const [places, setPlaces] = useState([]);
    const [searchType, setSearchType] = useState("hospital");
    const [loading, setLoading] = useState(false);

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCenter([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    console.error("Error getting location", error);
                    toast.error("Could not get your location. Using default.");
                }
            );
        }
    }, []);

    // Search Logic using Nominatim (OpenStreetMap) with Multiple Queries
    const searchNearby = async (type, queries) => {
        setSearchType(type);
        setLoading(true);
        setPlaces([]);
        try {
            const lat = center[0];
            const lon = center[1];
            // Viewbox for ~500km context (approx 5 degrees) to find ANYTHING if local results fail
            const viewbox = `${lon - 5.0},${lat + 5.0},${lon + 5.0},${lat - 5.0}`;

            // Execute all queries in parallel with higher limit
            const requests = queries.map(q =>
                axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=50&viewbox=${viewbox}`)
            );

            const responses = await Promise.all(requests);

            // Merge results
            let allResults = [];
            responses.forEach(res => {
                if (res.data) allResults = [...allResults, ...res.data];
            });

            // Deduplicate by place_id
            const uniquePlaces = Array.from(new Map(allResults.map(item => [item.place_id, item])).values());

            if (uniquePlaces.length > 0) {
                // Process and Sort results by distance
                const processedPlaces = uniquePlaces.map(place => {
                    const dist = calculateDistance(lat, lon, parseFloat(place.lat), parseFloat(place.lon));
                    return { ...place, distance: dist };
                })
                    .sort((a, b) => a.distance - b.distance); // Nearest first

                // Filter Logic: Vets/Grooming -> 500km limit, Others -> 100km strict
                const maxDistance = (type === 'hospital' || type === 'grooming') ? 500 : 100;

                const nearbyPlaces = processedPlaces.filter(p => p.distance <= maxDistance);

                if (nearbyPlaces.length > 0) {
                    setPlaces(nearbyPlaces);
                    toast.success(`Found ${nearbyPlaces.length} locations!`);
                } else {
                    toast.warn(`No results found within ${maxDistance}km.`);
                    setPlaces([]);
                }
            } else {
                toast.warn("No results found.");
                setPlaces([]);
            }
        } catch (err) {
            console.error(err);
            toast.error("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4 myPet-header">Nearby Services</h2>

            {/* Quick Actions */}
            <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                <button
                    className={`btn ${searchType === 'hospital' ? 'btn-danger' : 'btn-outline-danger'} px-4 py-2`}
                    onClick={() => searchNearby('hospital', ['veterinary', 'animal hospital', 'veterinary clinic'])}
                >
                    <i className="bi bi-hospital-fill me-2"></i> Vet Clinics
                </button>
                <button
                    className={`btn ${searchType === 'pharmacy' ? 'btn-primary' : 'btn-outline-primary'} px-4 py-2`}
                    onClick={() => searchNearby('pharmacy', ['pharmacy', 'medical store', 'chemist'])}
                >
                    <i className="bi bi-capsule me-2"></i> Pharmacies
                </button>
                <button
                    className={`btn ${searchType === 'park' ? 'btn-success' : 'btn-outline-success'} px-4 py-2`}
                    onClick={() => searchNearby('park', ['park', 'public park', 'garden'])}
                >
                    <i className="bi bi-tree-fill me-2"></i> Pet Parks
                </button>
                <button
                    className={`btn ${searchType === 'grooming' ? 'btn-warning' : 'btn-outline-warning'} px-4 py-2`}
                    onClick={() => searchNearby('grooming', ['pet shop', 'pet store', 'pet grooming'])}
                >
                    <i className="bi bi-scissors me-2"></i> Grooming
                </button>
            </div>

            <div className="row">
                {/* Map Section */}
                <div className="col-md-8 mb-4">
                    <div className="card shadow border-0 p-1" style={{ height: "65vh" }}>
                        <MapContainer
                            center={center}
                            zoom={11}
                            style={{ height: "100%", width: "100%", borderRadius: "10px" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapUpdater center={center} />

                            {/* User Marker */}
                            <Marker position={center} icon={userIcon}>
                                <Popup>
                                    <div className="text-center">
                                        <strong>Your Location</strong>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Place Markers */}
                            {places.map((place, idx) => (
                                <Marker
                                    key={idx}
                                    position={[parseFloat(place.lat), parseFloat(place.lon)]}
                                    icon={placeIcon}
                                >
                                    <Popup>
                                        <div style={{ minWidth: "160px" }}>
                                            <strong className="d-block mb-1">{place.display_name.split(',')[0]}</strong>
                                            <span className="badge bg-secondary mb-2">{place.distance.toFixed(1)} km away</span>
                                            <br />
                                            <small className="d-block text-muted mb-2 text-truncate">{place.display_name}</small>
                                            <button
                                                className="btn btn-sm btn-primary w-100"
                                                onClick={() => {
                                                    // Opens Google Maps Directions in new tab
                                                    // Omitting origin lets Google Maps use "My Location" automatically
                                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}&travelmode=driving`, '_blank');
                                                }}
                                            >
                                                <i className="bi bi-cursor-fill me-1"></i> Get Directions
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                    <div className="text-center mt-2 small text-muted">
                        Searching within 100km radius. Sorted by distance.
                    </div>
                </div>

                {/* Results List Section */}
                <div className="col-md-4">
                    <h5 className="mb-3 d-flex justify-content-between align-items-center">
                        Results
                        <span className="badge bg-secondary">{places.length}</span>
                    </h5>
                    {loading && <div className="text-center my-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-2">Scanning area...</p></div>}

                    <div className="pet-table overflow-auto" style={{ maxHeight: "65vh" }}>
                        {places.length > 0 ? (
                            <ul className="list-group list-group-flush">
                                {places.map((place, idx) => (
                                    <li
                                        key={idx}
                                        className="list-group-item cursor-pointer list-group-item-action"
                                        style={{ cursor: "pointer", transition: "0.2s" }}
                                        onClick={() => {
                                            const lat = parseFloat(place.lat);
                                            const lon = parseFloat(place.lon);
                                            // Update map center but keep zoom
                                            setCenter([lat, lon]);
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div style={{ maxWidth: "75%" }}>
                                                <h6 className="mb-1 fw-bold text-truncate">{place.display_name.split(',')[0]}</h6>
                                                <small className="text-muted d-block" style={{ fontSize: "0.8em" }}>
                                                    {place.display_name.split(',').slice(1, 3).join(',')}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-light text-dark border">
                                                    {place.distance.toFixed(1)} km
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            !loading && (
                                <div className="text-center mt-5 text-muted">
                                    <i className="bi bi-search display-4 d-block mb-3 opacity-50"></i>
                                    <p>Select a category to find services.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NearbyServices;
