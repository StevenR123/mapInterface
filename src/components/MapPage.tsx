import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapPage: React.FC = () => {
  const [mapData, setMapData] = useState<any | null>(null);
  const [newMarker, setNewMarker] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('mapData');
    if (storedData) {
      setMapData(JSON.parse(storedData));
    }
  }, []);

  const exportMapData = () => {
    if (mapData) {
      const dateTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '-').replace(/, /g, ':').replace(/ /g, '-'); // Format dateTime for file name
      const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mapData.map.name || 'mapData'}-${dateTime}.json`; // Append dateTime to file name
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleMapClick = (event: L.LeafletMouseEvent) => {
    if (!editMode || (event.originalEvent.target instanceof Element && event.originalEvent.target.closest('.map-header'))) return; // Prevent adding a marker if editMode is false or the click is inside the map-header

    const mapBounds = L.latLngBounds(map.bounds); // Convert map.bounds to a valid LatLngBounds object
    const isWithinBounds = mapBounds.contains(event.latlng);
    if (!isWithinBounds) {
      return; // Prevent adding a marker if the click is outside the map bounds
    } // Prevent adding a marker if the click is outside the map bounds

    const mapContainer = document.querySelector('.leaflet-container');
    const mapRect = mapContainer?.getBoundingClientRect();

    setNewMarker({
      id: Date.now(),
      position: event.latlng,
      label: '',
      description: '',
      icon: {
        imageUrl: '',
        size: [40, 40],
      },
      clickPosition: {
        x: event.containerPoint.x + (mapRect?.left || 0),
        y: event.containerPoint.y + (mapRect?.top || 0) - 300, // Adjust y position to align with the click
      },
    });
  };

  const saveMarker = () => {
    if (newMarker) {
      const updatedMarker = {
        ...newMarker,
        label: newMarker.label || `Marker ${mapData.markers.length + 1}`,
        icon: {
          ...newMarker.icon,
          imageUrl: newMarker.icon.imageUrl || 'https://i.imgur.com/oOvZCp8.png',
        },
      };

      setMapData((prevData: any) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          markers: [...prevData.markers, updatedMarker],
        };
      });
      setNewMarker(null);
    }
  };

  const handleMarkerClick = (marker: { id: string; position: [number, number]; label: string; description: string; icon: { imageUrl: string; size: [number, number] } }) => {
    if (!editMode) return; // Prevent editing a marker if editMode is false

    setNewMarker({
      ...marker,
      clickPosition: {
        x: window.innerWidth / 2 + window.scrollX, // Center horizontally in the current view
        y: window.innerHeight / 2 + window.scrollY - 300, // Center vertically in the current view
      },
    });
  };

  const MapEventHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const CenterMapButton: React.FC<{ mapBounds: L.LatLngBoundsExpression }> = ({ mapBounds }) => {
    const mapInstance = useMap();

    const handleCenterMap = () => {
      if (mapInstance && mapBounds) {
        mapInstance.fitBounds(mapBounds);
      } else {
        console.error('Map instance or bounds are not available');
      }
    };

    return (
      <button
        onClick={handleCenterMap}
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Center Map
      </button>
    );
  };

  if (!mapData) {
    return <div>No map data available. Please upload a JSON file.</div>;
  }

  const { map, markers } = mapData;

  return (
    <>
       <div
            className="map-header"
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              width: '92%',
              maxWidth: '100%',
              position: 'relative',
              top: '0',
              zIndex: 1000,
              padding: '10px',
            }}
        >
            <button
              onClick={exportMapData}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              Export Map Data
            </button>            
            <button
              onClick={() => setEditMode((prev) => !prev)}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            >
              {editMode ? 'Edit' : 'View'}
            </button>
            <button
                onClick={() => window.location.href = '/'}
            >
                Back
            </button>
          </div>        
      {newMarker && (
        <div
          style={{
            position: 'absolute',
            top: `${newMarker.clickPosition.y}px`,
            left: `${newMarker.clickPosition.x}px`,
            transform: 'translate(-50%, 100%)',
            background: 'Black',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <h3>New Marker Properties</h3>
          <label>
            Label:
            <input
              type="text"
              value={newMarker.label}
              onChange={(e) => setNewMarker({ ...newMarker, label: e.target.value })}
            />
          </label>
          <br />
          <label>
            Description:
            <input
              type="text"
              value={newMarker.description}
              onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
            />
          </label>
          <br />
          <label>
            Icon URL:
            <input
              type="text"
              value={newMarker.icon.imageUrl}
              onChange={(e) => setNewMarker({ ...newMarker, icon: { ...newMarker.icon, imageUrl: e.target.value } })}
            />
          </label>
          <br />
          <button onClick={saveMarker}>Save Marker</button>
          <button onClick={() => setNewMarker(null)}>Cancel</button>
        </div>
      )}
      <div>
        <MapContainer
          bounds={map.bounds}
          style={{
            height: '100vh',
            width: '100vw',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <div
            className="center-map-button"
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
              position: 'absolute',
              top: '10px',
              zIndex: 1000,
            }}
          >
            <CenterMapButton mapBounds={L.latLngBounds(map.bounds)} />
          </div>
          <MapEventHandler />
          <ImageOverlay url={map.imageUrl} bounds={map.bounds} />
          {markers.map((marker: { id: string; position: [number, number]; label: string; description: string; icon: { imageUrl: string; size: [number, number] } }) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={L.icon({
                iconUrl: marker.icon.imageUrl || 'https://i.imgur.com/oOvZCp8.png',
                iconSize: marker.icon.size || [40, 40],
              })}
              eventHandlers={{
                click: () => handleMarkerClick(marker),
              }}
            >
              {editMode ? null : (
                <Popup>
                  <strong>{marker.label}</strong>
                  <p>{marker.description}</p>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
};

export default MapPage;
