import { useEffect, useState } from "react";

import {
  MapContainer,
  GeoJSON,
  TileLayer
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { apiBase, authHeaders } from "../../api/dairyguardApi";


// ============================================================
// DISTRICT COLOUR
// ============================================================

const getDistrictColor = (riskScore) => {

  if (riskScore >= 80) {
    return "#96362C";       // Critical
  }

  if (riskScore >= 60) {
    return "#E1A13B";       // High
  }

  if (riskScore >= 40) {
    return "#D9BD49";       // Moderate
  }

  return "#7FA56F";         // Lower risk
};


// ============================================================
// NORMALIZE DISTRICT NAME
// ============================================================

const normalizeDistrictName = (name) => {

  if (!name) {
    return "";
  }

  return String(name)
    .trim()
    .toLowerCase()
    .replace(" district", "");

};


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MaharashtraMap() {

  const [districtStats, setDistrictStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [maharashtraGeoJSON, setMaharashtraGeoJSON] = useState(null);

  useEffect(() => {
    fetch("/maharashtra.geojson")
      .then((response) => response.json())
      .then(setMaharashtraGeoJSON)
      .catch((err) =>
        setError("Failed to load map data: " + err.message)
      );
  }, []);

  useEffect(() => {

    const fetchDistrictRisk = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${apiBase}/api/district-risk`,
          { headers: { ...authHeaders() } }
        );

        if (!response.ok) {
          throw new Error(`Backend returned HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.districts)) {
          throw new Error("Invalid response from /api/district-risk");
        }

        const statsMap = {};

        data.districts.forEach((district) => {
          const key = normalizeDistrictName(district.district);
          statsMap[key] = district;
        });

        setDistrictStats(statsMap);

      } catch (err) {
        setError(err.message || "Unable to connect to DairyGuard backend");
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictRisk();

  }, []);

  const districtStyle = (feature) => {
    const districtName = feature?.properties?.district;
    const districtKey = normalizeDistrictName(districtName);
    const stats = districtStats[districtKey];
    const riskScore = Number(stats?.risk_score || 0);

    return {
      fillColor: getDistrictColor(riskScore),
      color: "#FFFFFF",
      weight: 1.5,
      fillOpacity: 0.75
    };
  };

  const onEachDistrict = (feature, layer) => {
    const districtName = feature?.properties?.district;

    layer.on({
      mouseover: (event) => {
        event.target.setStyle({
          weight: 3,
          color: "#1B231E",
          fillOpacity: 0.9
        });

        event.target.bringToFront();

        const districtKey = normalizeDistrictName(districtName);
        const stats = districtStats[districtKey];

        setSelectedDistrict({
          name: districtName,
          farms: stats?.farms,
          animals: stats?.animals,
          milk_received_liters: stats?.milk_received_liters,
          risk_score: stats?.risk_score,
          active_risk_signals: stats?.active_risk_signals
        });
      },

      mouseout: (event) => {
        event.target.setStyle(districtStyle(feature));
        setSelectedDistrict(null);
      }
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden"
      }}
    >

      {loading && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            zIndex: 1000,
            background: "#FFFFFF",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            fontSize: "13px",
            fontWeight: 600
          }}
        >
          Loading Maharashtra risk data...
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            zIndex: 1000,
            background: "#FFF5F5",
            color: "#96362C",
            padding: "10px 15px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            fontSize: "13px",
            fontWeight: 600
          }}
        >
          Backend error: {error}
        </div>
      )}

      <MapContainer
        center={[19.6633, 75.3280]}
        zoom={7}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {maharashtraGeoJSON && (
          <GeoJSON
            key={JSON.stringify(districtStats)}
            data={maharashtraGeoJSON}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        )}

      </MapContainer>

      {selectedDistrict && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            background: "#FFFFFF",
            borderRadius: "10px",
            padding: "16px",
            minWidth: "240px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)"
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#1B231E" }}>
            {selectedDistrict.name}
          </h3>

          <p>
            <strong>Farms:</strong> {selectedDistrict.farms ?? "N/A"}
          </p>

          <p>
            <strong>Animals:</strong> {selectedDistrict.animals ?? "N/A"}
          </p>

          <p>
            <strong>Milk received:</strong>{" "}
            {selectedDistrict.milk_received_liters != null
              ? Number(selectedDistrict.milk_received_liters).toLocaleString()
              : "N/A"}{" "}
            L
          </p>

          <p>
            <strong>Risk score:</strong>{" "}
            {selectedDistrict.risk_score != null
              ? Number(selectedDistrict.risk_score).toFixed(1)
              : "N/A"}
          </p>

          <p>
            <strong>Risk signals:</strong>{" "}
            {selectedDistrict.active_risk_signals ?? "N/A"}
          </p>
        </div>
      )}

    </div>
  );
}
