import React, { useState, useEffect } from "react";
import { db } from "./firebase_conf";
import { addDoc, collection, getDocs, deleteDoc,doc, updateDoc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminPg = () => {
    const [eventName, setEventName] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState(0.0);
    const [longitude, setLongitude] = useState(0.0);
    const [description, setDescription] = useState('');
    const [participants, setParticipants] = useState(0);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'event_list'));
                const eventsList = querySnapshot.docs.map(doc => ({ 
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(eventsList);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching events: ", err);
                setError(err);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const handleEventCreate = async (e) => {
        e.preventDefault();
        try {
            const eventRef = await addDoc(collection(db, 'event_list'), {
                eventName,
                type,
                location,
                latitude,
                longitude,
                description,
                participants,
                createdAt: new Date()
            });

            console.log("Event created with ID: ", eventRef.id);
            resetForm();
            setShowCreateForm(false);
        } catch(error) {
            console.error("Error creating event: ", error);
        }
    }

    const handleEventUpdate = async (e) => {
        e.preventDefault();
        if (!editingEvent) return;

        try {
            const eventDocRef = doc(db, 'event_list', editingEvent.id);
            await updateDoc(eventDocRef, {
                eventName,
                type,
                location,
                latitude,
                longitude,
                description,
                participants
            });

            console.log("Event updated with ID: ", editingEvent.id);
            resetForm();
            setShowCreateForm(false);
            setEditingEvent(null);

            // Refresh events list
            const querySnapshot = await getDocs(collection(db, 'event_list'));
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
        } catch(error) {
            console.error("Error updating event: ", error);
        }
    }

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteDoc(doc(db, 'event_list', eventId));
            console.log("Event deleted with ID: ", eventId);
            
            // Refresh events list
            const querySnapshot = await getDocs(collection(db, 'event_list'));
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
        } catch(error) {
            console.error("Error deleting event: ", error);
        }
    }

    const startEditEvent = (event) => {
        setEditingEvent(event);
        setEventName(event.eventName);
        setType(event.type);
        setLocation(event.location);
        setLatitude(event.latitude);
        setLongitude(event.longitude);
        setDescription(event.description);
        setParticipants(event.participants);
        setShowCreateForm(true);
    }

    const resetForm = () => {
        setEventName('');
        setType('');
        setLocation('');
        setLatitude(0.0);
        setLongitude(0.0);
        setDescription('');
        setParticipants(0);
    }

    if (loading) return (
        <div className="container mt-5 text-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="container mt-5">
            <div className="alert alert-danger">
                Error loading events: {error.message}
            </div>
        </div>
    );

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Event List</h2>

            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>Event Name</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Description</th>
                        <th>Participants</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td>{event.eventName}</td>
                            <td>{event.type}</td>
                            <td>{event.location}</td>
                            <td>{event.latitude.toFixed(4)}</td>
                            <td>{event.longitude.toFixed(4)}</td>
                            <td>{event.description}</td>
                            <td>{event.participants}</td>
                            <td>
                            <div className="btn-group" role="group">
                                    <button 
                                        className="btn btn-sm btn-warning"
                                        onClick={() => startEditEvent(event)}
                                    >
                                        Update
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteEvent(event.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {events.length === 0 && (
                <div className="alert alert-info text-center">
                    No events found.
                </div>
            )}
            <button 
                type="button" 
                className="btn btn-primary w-100 mb-3"
                onClick={() => {
                    resetForm();
                    setShowCreateForm(!showCreateForm);
                }}
            >
                {showCreateForm ? 'Cancel' : 'New Event'}
            </button>
           

            {showCreateForm && (
                <div className="container mt-3">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card shadow">
                                <div className="card-header bg-primary text-white">
                                    <h4 className="mb-0">
                                        {editingEvent ? 'Update Event' : 'Create New Event'}
                                    </h4>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={editingEvent ? handleEventUpdate : handleEventCreate}>
                                   
                                        <div className="row mb-3">
                                            <div className="col-md-4">
                                                <label className="form-label">Event Name</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control"
                                                    value={eventName}
                                                    onChange={(e) => setEventName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Event Type</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control"
                                                    value={type}
                                                    onChange={(e) => setType(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Location</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Latitude</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control"
                                                    value={latitude}
                                                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                                                    step="0.0001"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Longitude</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control"
                                                    value={longitude}
                                                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                                                    step="0.0001"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Description</label>
                                                <textarea 
                                                    className="form-control"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows="3"
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Participants</label>
                                                <input 
                                                    type="number" 
                                                    className="form-control"
                                                    value={participants}
                                                    onChange={(e) => setParticipants(parseInt(e.target.value))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="btn btn-primary w-100"
                                        >
                                            {editingEvent ? 'Update Event' : 'Create Event'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
        
    );
}

export default AdminPg;