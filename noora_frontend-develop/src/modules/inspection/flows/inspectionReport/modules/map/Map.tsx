import "leaflet/dist/leaflet.css";

import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

interface Props {
  latitude?: number;
  longitude?: number;
}

function Map({ latitude, longitude }: Props) {
  const position: any = [latitude || 0, longitude || 0];

  const customIcon = divIcon({
    className: "custom-marker-icon",
    html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="24" height="24">
      <path d="M12 2C7.03 2 3 6.03 3 11C3 16.25 12 22 12 22C12 22 21 16.25 21 11C21 6.03 16.97 2 12 2Z" fill="#FF0000"/>
      <path d="M12 13.5C10.67 13.5 9.5 12.33 9.5 11C9.5 9.67 10.67 8.5 12 8.5C13.33 8.5 14.5 9.67 14.5 11C14.5 12.33 13.33 13.5 12 13.5Z" fill="#FFFFFF"/>
      <path d="M12 7.5C10.76 7.5 9.75 8.51 9.75 9.75C9.75 10.99 10.76 12 12 12C13.24 12 14.25 10.99 14.25 9.75C14.25 8.51 13.24 7.5 12 7.5Z" fill="#FFFFFF"/>
    </svg>
  `,
  });

  return (
    <MapContainer
      center={position}
      zoom={17}
      scrollWheelZoom={false}
      className="m-4 rounded-xl"
      style={{
        height: +window.innerWidth > 1400 ? +window.innerWidth - 1200 : 350,
        zIndex: "2",
      }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {latitude && longitude && (
        <Marker icon={customIcon} title="بازرس" position={position} />
      )}
    </MapContainer>
  );
}

export default Map;
