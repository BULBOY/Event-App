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

    useEffect(() => {
        if (mapRef.current && events.length > 0) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }

            const map = L.map(mapRef.current).setView([51.505, -0.09], 10);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            events.forEach((event) => {
                if (event.latitude && event.longitude) {
                    const marker = L.marker([event.latitude, event.longitude]).addTo(map);
            
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
                                handleBooking(event.id, user.uid); // Call the booking function with event and user details
                            });
                        }
                    });
                }
            });
            

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, [events, user]);

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
    );
};

export default MapComponent;
