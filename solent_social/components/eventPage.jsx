import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "./firebase_conf";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserId(parsedUser.uid)
          const userDoc = await getDoc(doc(db, 'users', parsedUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const eventIds = userData.eventList || [];

            const eventPromises = eventIds.map(eventId => getDoc(doc(db, 'event_list', eventId)));
            const eventDocs = await Promise.all(eventPromises);

            const eventList = eventDocs
              .map(eventDoc => eventDoc.exists() ? {...eventDoc.data(), id: eventDoc.id} : null)
              .filter(event => event !== null);
            
            setEvents(eventList);
          }
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle event deletion
  const handleDeleteEvent = async (userId, eventId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const eventDocRef = doc(db, 'event_list', eventId);
      const eventSnapshot = await getDoc(eventDocRef);
      const eventData = eventSnapshot.data();
  
      await updateDoc(userDocRef, {
        eventList: arrayRemove(eventId)
      });

      await updateDoc(eventDocRef, {participants:eventData.participants +1,})
  
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== eventId)
      );
  
      alert('Event successfully cancelled');

      window.location.reload();
     
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert('Failed to cancel event. Please try again.');
    }
  };

   // Toggle event details visibility
  const toggleEventDetails = (eventId) => {
    setSelectedEventId(prevId => prevId === eventId ? null : eventId);
  };

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events</div>;

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Booked events</h2>

      <div className="list-group">
        {events.map((event) => (
          <div key={event.id} className="list-group-item list-group-item-action w-50">
            <div className="d-flex w-100 justify-content-between">
              <h5 
                className="mb-1 cursor-pointer"
                onClick={() => toggleEventDetails(event.id)}
              >
                {event.eventName}
              </h5>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteEvent(userId, event.id)}
              >
                Cancel
              </button>
            </div>

            {selectedEventId === event.id && (
              <div className="mt-3 p-3 bg-light rounded">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Type:</strong> {event.type}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Description:</strong> {event.description}</p>
                    <p><strong>Maximum Participants:</strong> {event.participants}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="alert alert-info text-center">
          No events found.
        </div>
      )}
    </div>
  );
}

export default EventList;