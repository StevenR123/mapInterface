// Importing React and necessary hooks for managing state and side effects
import React, { useEffect, useState } from 'react';
// Importing components and utilities from react-leaflet for map functionality
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
// Importing Leaflet's CSS for map styling
import 'leaflet/dist/leaflet.css';
// Importing Leaflet library for map-related operations
import L from 'leaflet';

const MapPage: React.FC = () => {
  // State to store map data loaded from localStorage or other sources
  const [mapData, setMapData] = useState<any | null>(null);
  // State to store details of a new marker being added to the map
  const [newMarker, setNewMarker] = useState<any | null>(null);
  // State to toggle between edit and view modes
  const [editMode, setEditMode] = useState(false);
  const [zoomRender, setZoomRender] = useState(false);

  useEffect(() => {
    // Load map data from localStorage when the component mounts
    const storedData = localStorage.getItem('mapData');
    if (storedData) {
      setMapData(JSON.parse(storedData));
    }
  }, []);

  const exportMapData = () => {
    if (mapData) {
      // Format the current date and time for the exported file name
      const dateTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\//g, '-').replace(/, /g, ':').replace(/ /g, '-');
      // Create a Blob object containing the map data in JSON format
      const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
      // Generate a URL for the Blob object
      const url = URL.createObjectURL(blob);
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mapData.map.name || 'mapData'}-${dateTime}.json`; // Append dateTime to file name
      a.click();
      // Revoke the Blob URL to free up memory
      URL.revokeObjectURL(url);
    }
  };

  const handleMapClick = (event: L.LeafletMouseEvent) => {
    // console.log('Map clicked at:', event.latlng);
    if (!editMode || (event.originalEvent.target instanceof Element && event.originalEvent.target.closest('.center-map-button'))) return; // Prevent adding a marker if editMode is false or the click is on the center map button

    if (!mapData?.map?.bounds) {
      console.error('Map bounds are not defined');
      return;
    }

    const mapBounds = L.latLngBounds(mapData.map.bounds); // Convert map.bounds to a valid LatLngBounds object
    const isWithinBounds = mapBounds.contains(event.latlng);
    // console.log('Edit mode:', editMode);
    // console.log('Event target:', event.originalEvent.target);
    // console.log('Map bounds:', mapData?.map?.bounds);
    // console.log('Is within bounds:', isWithinBounds);
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
        imageUrl: mapData.map.defaultMarkerImageUrl,
        size: [40, 40],
      },
      maxZoom: mapData?.map?.currentZoom + 2 || null, // Default maxZoom to current zoom level + 2 or 16
      minZoom: mapData?.map?.currentZoom - 2 || null, // Default minZoom to current zoom level - 2 or 8
      clickPosition: {
        x: event.containerPoint.x + (mapRect?.left || 0),
        y: event.containerPoint.y + (mapRect?.top || 0) - 300, // Adjust y position to align with the click
      },
    });
  };

  const saveMarker = () => {
    // console.log('Saving marker:'); // Log the marker details before saving
    if (newMarker) {
      const updatedMarker = {
        ...newMarker,
        label: newMarker.label || `Marker ${mapData.markers.length + 1}`,
        icon: {
          ...newMarker.icon,
          imageUrl: newMarker.icon.imageUrl || 'https://i.imgur.com/CRHS2ni.png',
        },
        maxZoom: newMarker.maxZoom || null, // Add maxZoom attribute
        minZoom: newMarker.minZoom || null, // Add minZoom attribute
      };

      // console.log('New marker created:', updatedMarker); // Log the new marker details

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

  const handleMarkerClick = (marker: { id: string; position: [number, number]; label: string; description: string; icon: { imageUrl: string; size: [number, number] }, maxZoom?: number, minZoom?: number }) => {
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
    const mapInstance = useMap();

    useMapEvents({
      click: handleMapClick,
      zoomend: () => {
        if (mapInstance) {
          const currentZoom = mapInstance.getZoom();
          mapData.map.currentZoom = currentZoom; // Update the current zoom level in mapData
          // console.log('Current zoom level:', mapData.map.currentZoom); // Log the current zoom level

          setMapData((prevData: any) => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              markers: prevData.markers.map((marker: any) => ({
                ...marker,
                visible: (!marker.maxZoom || currentZoom <= marker.maxZoom) && (!marker.minZoom || currentZoom >= marker.minZoom),
              })),
            };
          });
        } else {
          console.error('Map instance is not available');
        }
      },
    });

    return null;
  };

  const CenterMapButton: React.FC = () => {
    const mapInstance = useMap();

    const handleCenterMap = () => {
      if (mapInstance && mapData?.map?.imageHeight && mapData?.map?.imageWidth) {
        let height = mapData.map.imageHeight;
        let width = mapData.map.imageWidth;

        while (height > 10 || width > 10) {
          height /= 2;
          width /= 2;
        }

        const bounds: L.LatLngBoundsLiteral = [[0, 0], [height, width]];
        mapInstance.fitBounds(bounds);
      } else {
        console.error('Map instance or dimensions are not available');
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

  const SearchBar: React.FC<{ markers: any[] }> = ({ markers }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMarkers, setFilteredMarkers] = useState<any[]>([]);
    const mapInstance = useMap();

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      const filtered = markers.filter(
        (m: { label: string; description: string }) =>
          m.label.toLowerCase().includes(query.toLowerCase()) ||
          m.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMarkers(filtered);
    };

    const handleMarkerClick = (marker: { position: [number, number], minZoom: number, maxZoom: number }) => {
      // console.log('Marker clicked:', marker); // Log the marker details
      const newZoomLevel = marker.minZoom && marker.maxZoom
        ? Math.floor((marker.minZoom + marker.maxZoom) / 2)
        : mapData?.map?.currentZoom;

      // console.log('newZoomLevel:', newZoomLevel); // Log the new zoom level
      mapInstance.setView(marker.position, newZoomLevel);
      setFilteredMarkers([]); // Clear the dropdown after selection
    };

    return (
      <div style={{ position: 'absolute', right: '10px', zIndex: 1000 }}>
        <input
          type="text"
          placeholder="Search for a marker"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ padding: '10px', fontSize: '16px', width: '200px' }}
        />
        {filteredMarkers.length > 0 && (
          <ul
            style={{
              marginTop: '5px',
              padding: '10px',
              backgroundColor: '#1a1a1a', // Matches the search bar color
              border: '1px solid #ccc',
              borderRadius: '5px',
              listStyleType: 'none',
              maxHeight: '150px',
              overflowY: 'auto',
              color: 'white', // Ensures text is white
            }}
          >
            {filteredMarkers.map((marker, index) => (
              <li
                key={index}
                onClick={() => handleMarkerClick(marker)}
                style={{ padding: '5px', cursor: 'pointer', color: 'white' }} // Ensures text is white
              >
                {marker.label || marker.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const ZoomLevelDisplay: React.FC = () => {
    const mapInstance = useMap();
    const [zoomLevel, setZoomLevel] = useState(mapInstance.getZoom());

    useEffect(() => {
      const updateZoomLevel = () => setZoomLevel(mapInstance.getZoom());
      mapInstance.on('zoomend', updateZoomLevel);
      return () => {
        mapInstance.off('zoomend', updateZoomLevel);
      };
    }, [mapInstance]);

    return (
      <div
        style={{
          position: 'absolute',
          top: '68px',
          left: '13px', // Changed from right to left
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '14px',
        }}
      >
        {zoomLevel}
      </div>
    );
  };

  useEffect(() => {
    if (mapData?.map?.imageUrl) {
      const img = new Image();
      img.src = mapData.map.imageUrl;
      img.onload = () => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        let height = imageHeight;
        let width = imageWidth;

        while (height > 10 || width > 10) {
          height /= 2;
          width /= 2;
        }

        const bounds: L.LatLngBoundsLiteral = [[0, 0], [height, width]];

        setMapData((prevData: any) => ({
          ...prevData,
          map: {
            ...prevData.map,
            imageWidth,
            imageHeight,
            bounds,
          },
        }));
      };
    }
  }, [mapData?.map?.imageUrl]);

  if (!mapData) {
    return <div>No map data available. Please upload a JSON file.</div>;
  }

  const { map, markers } = mapData;

  const center: [number, number] = map.bounds ? [
        (map.bounds[0][0] + map.bounds[1][0]) / 2,
        (map.bounds[0][1] + map.bounds[1][1]) / 2
      ] : [0.5, 0.5]; // Default center if bounds are invalid

      const initialZoom = map.bounds ? Math.max(8, Math.min(16, Math.floor(Math.log2(Math.max(map.bounds[1][0] - map.bounds[0][0], map.bounds[1][1] - map.bounds[0][1]))))) : 10; // Adjusted zoom to start 2 levels lower
      mapData.map.currentZoom = initialZoom; // Set the initial zoom level in mapData

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
        <label style={{ marginLeft: '10px', fontSize: '16px' }}>
          <input
            type="checkbox"
            checked={zoomRender}
            onChange={(e) => setZoomRender(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          Zoom Render
        </label>
        <button
          onClick={() => window.location.href = '/'}
        >
          Back
        </button>
      </div>
      {newMarker && newMarker.clickPosition && (
        <div
          style={{
            position: 'absolute',
            top: `${newMarker.clickPosition.y}px`,
            left: `${newMarker.clickPosition.x}px`,
            transform: 'translate(-50%, 100%)',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '20px',
            zIndex: 1000,
            textAlign: 'left',
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
              onChange={(e) => setNewMarker({ ...newMarker.icon, imageUrl: e.target.value })}
            />
          </label>
          <br />
          <label>
            Max Zoom: (zoom in)
            <input
              type="number"
              value={(newMarker.maxZoom !== undefined ? newMarker.maxZoom : (mapData?.map?.currentZoom + 2)) || ''} // Default maxZoom to current zoom level + 2
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setNewMarker({ ...newMarker, maxZoom: value ? parseInt(value, 10) : null });
                }
              }}
              onKeyPress={(e) => {
                if (!/\d/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </label>
          <br />
          <label>
            Min Zoom: (zoom out)
            <input
              type="number"
              value={(newMarker.minZoom !== undefined ? newMarker.minZoom : (mapData?.map?.currentZoom - 2)) || ''} // Default minZoom to 1
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setNewMarker({ ...newMarker, minZoom: value ? parseInt(value, 10) : null });
                }
              }}
              onKeyPress={(e) => {
                if (!/\d/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </label>
          <br />
          <button onClick={saveMarker}>Save Marker</button>
          <button onClick={() => setNewMarker(null)}>Cancel</button>
          <button onClick={() => {
  setMapData((prevData: any) => {
    if (!prevData) return prevData;
    return {
      ...prevData,
      markers: prevData.markers.filter((m: any) => m.id !== newMarker.id),
    };
  });
  setNewMarker(null);
}}>Delete Marker</button>
        </div>
      )}
      <MapContainer
        bounds={map.bounds}
        center={center}
        zoom={initialZoom}
        style={{
          height: 'calc(100vh - 60px)', // Shorten the height to account for the top buttons
          width: '100vw',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
        attributionControl={false} // Disable the Leaflet attribution tag
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
          <ZoomLevelDisplay />
          <CenterMapButton />
          <SearchBar markers={markers} />
        </div>
        <MapEventHandler />
        <ImageOverlay
  url={map.imageUrl}
  bounds={(() => {
    // console.log('map:', map.imageHeight, map.imageWidth); // Log the image dimensions
    if (map.imageHeight && map.imageWidth && map.imageHeight > 0 && map.imageWidth > 0) {
      let height = map.imageHeight;
      let width = map.imageWidth;

      while (height > 10 || width > 10) {
        height /= 2;
        width /= 2;
      }

    //   console.log('Adjusted bounds:', height, width); // Log the adjusted bounds

      return [[0, 0], [height, width]];
    }
    return [[0, 0], [1, 1]]; // Fallback to square if dimensions are invalid
  })()}
        />
        {markers.filter((marker: any) => marker.visible !== false).map((marker: any, index: number) => (
          <Marker
            key={`${marker.id}-${index}`}
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
    </>
  );
};

export default MapPage;
