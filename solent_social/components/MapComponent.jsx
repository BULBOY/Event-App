import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "./firebase_conf";

// Import default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const MapComponent = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [noEventsFound, setNoEventsFound] = useState(false);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    // Fix for default marker icon in Leaflet
    useEffect(() => {
        const DefaultIcon = L.icon({
            iconUrl: icon,
            shadowUrl: iconShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "event_list"));
                const eventsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setEvents(eventsList);
                setFilteredEvents(eventsList);
            } catch (err) {
                console.error("Error fetching events: ", err);
                setError(err);
            }
        };

        fetchEvents();

        // Load user data from session
        const userData = sessionStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsLoggedIn(parsedUser.isLoggedIn);
        }
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    
        // If search term is empty, show all events
        if (term === '') {
            setFilteredEvents(events);
        } else {
            // Filter events by type
            const filtered = events.filter((event) => 
                event.type && event.type.toLowerCase().includes(term)
            );
            setFilteredEvents(filtered);
        }
    };

    useEffect(() => {
        if (mapRef.current && events.length > 0) {
            // If map doesn't exist, create it
            if (!mapInstanceRef.current) {
                const map = L.map(mapRef.current).setView([51.9533, 0.1883],7);
    
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(map);
    
                mapInstanceRef.current = map;
            }
    
            // Clear existing markers
            if (window.markers) {
                window.markers.forEach(marker => marker.remove());
            }
            window.markers = [];
    
            // Use filteredEvents if it has content, otherwise use all events
            const eventsToRender = filteredEvents.length > 0 ? filteredEvents : events;
    
            eventsToRender.forEach((event) => {
                if (event.latitude && event.longitude) {
                    const marker = L.marker([event.latitude, event.longitude]).addTo(mapInstanceRef.current);
            
                    const popupContent = `
                        <strong>Event Name: ${event.eventName || ""}</strong><br>
                        Type: ${event.type || "N/A"}<br>
                        Description: ${event.description || ""}<br>
                        Location: ${event.location || ""}<br>
                        Available bookings: ${event.participants || ""}<br>
                        <button id="book-${event.id}" style="cursor: pointer;">Book Event</button>
                    `;
            
                    marker.bindPopup(popupContent);
            
                    marker.on("popupopen", () => {
                        const bookButton = document.getElementById(`book-${event.id}`);
                        if (bookButton) {
                            bookButton.addEventListener("click", () => {
                                handleBooking(event.id, user.uid);
                            });
                        }
                    });
    
                    // Store markers globally to manage them
                    if (!window.markers) {
                        window.markers = [];
                    }
                    window.markers.push(marker);
                }
            });
        }
    
        // No return cleanup function to prevent map removal
    }, [events, filteredEvents, user]);

    const handleInputChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setNoEventsFound(false); // Reset no events found state

        // If search term is empty, show all events
        if (term === '') {
            setFilteredEvents(events);
            return;
        }

        // Filter events by type
        const filtered = events.filter((event) => 
            event.type && event.type.toLowerCase().includes(term)
        );

        // Set filtered events and check if no events found
        setFilteredEvents(filtered);
        
        // Only set noEventsFound to true if there are no matches and term is not empty
        if (filtered.length === 0 && term !== '') {
            setNoEventsFound(true);
        }
    };

    const handleBooking = async (eventId, userId) => {
        try {
            if (!userId) {
                alert("You need to be logged in to book events!");
            return;
            }
            const docRef = doc(db, "users", userId);
            const eventRef = doc(db, "event_list",eventId);
            const userSnapshot = await getDoc(docRef);
            const eventSnapshot = await getDoc(eventRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const bookedEvents = userData.eventList || [];
                const eventData = eventSnapshot.data();
    
                // Check if the event is already booked
                if (bookedEvents.includes(eventId)) {
                    console.log("Event is already booked.");
                    alert("You have already booked this event!");
                    return;
                }

                if (eventData.participants <= 0) {
                    alert("No more slots available for this event!");
                    return;
                }

                await updateDoc(eventRef, {
                    participants: eventData.participants - 1,
                });
    
                // Update the user's bookings if not already booked
                await updateDoc(docRef, {
                    eventList: arrayUnion(eventId),
                });

               
                console.log("Event booked successfully!");
                alert("Event booked successfully!");
                window.location.reload();
            
            } else {
                console.error("User document does not exist.");
                alert("User not found!");
            }
        } catch (err) {
            console.error("Error booking event: ", err);
            alert("An error occurred while booking the event. Please try again.");
        }
    };


    if (error) {
        return <div>Error loading events: {error.message}</div>;
    }

    return (
        <div className="min-vh-50 d-flex flex-column">
            <div className="container mb-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-danger text-white" >
                                Search events by type
                            </span>
                            <input 
                                type="text" 
                                className="form-control"
                                id="events"
                                aria-label="Event type"
                                value={searchTerm}
                                onChange={handleInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            {noEventsFound && (
                <div className="container text-center my-4">
                    <div className="alert alert-warning" role="alert">
                        No events found for type "{searchTerm}". 
                        Try a different event type or clear the search.
                    </div>
                </div>
            )}

            <div
                ref={mapRef}
                style={{
                    border: "1px solid black",
                    height: "500px",
                    width: "100%",
                }}
            >
                {events.length === 0 && <div>Loading events...</div>}
            </div>
        </div>
    );
};

export default MapComponent;
