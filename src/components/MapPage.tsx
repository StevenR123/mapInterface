import React, { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const MapPage: React.FC = () => {
  const [mapData, setMapData] = useState<any | null>(null);
  const [newMarker, setNewMarker] = useState<any | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('mapData');
    if (storedData) {
      setMapData(JSON.parse(storedData));
    }
  }, []);

  const exportMapData = () => {
    if (mapData) {
      const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mapData.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleMapClick = (event: L.LeafletMouseEvent) => {
    setNewMarker({
      id: Date.now(),
      position: event.latlng,
      label: '',
      description: '',
      icon: {
        imageUrl: '',
        size:[40, 40],
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

  const MapEventHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  if (!mapData) {
    return <div>No map data available. Please upload a JSON file.</div>;
  }

  const { map, markers } = mapData;

  return (
    <>
      <button onClick={exportMapData} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        Export Map Data
      </button>
      {newMarker && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'Black', padding: '20px', zIndex: 1000 }}>
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
      <MapContainer
        bounds={map.bounds}
        style={{
          height: '100vh',
          width: '100vw',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        <MapEventHandler />
        <ImageOverlay url={map.imageUrl} bounds={map.bounds} />
        {markers.map((marker: any) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={L.icon({
              iconUrl: marker.icon.imageUrl || 'https://i.imgur.com/oOvZCp8.png',
              iconSize: marker.icon.size || [40, 40],
            })}
          >
            <Popup>
              <strong>{marker.label}</strong>
              <p>{marker.description}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default MapPage;
