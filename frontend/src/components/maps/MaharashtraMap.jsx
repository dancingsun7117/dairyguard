import { useEffect, useState } from "react";

import {
  MapContainer,
  GeoJSON,
  TileLayer
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import geoJSONRaw from "../data/maharashtra.geojson?raw";

// Convert raw GeoJSON text into JavaScript object
const maharashtraGeoJSON = JSON.parse(geoJSONRaw);


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

  // ----------------------------------------------------------
  // Backend district data
  // ----------------------------------------------------------

  const [districtStats, setDistrictStats] = useState({});

  // ----------------------------------------------------------
  // Loading state
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Backend error
  // ----------------------------------------------------------

  const [error, setError] = useState(null);

  // ----------------------------------------------------------
  // Selected district
  // ----------------------------------------------------------

  const [selectedDistrict, setSelectedDistrict] =
    useState(null);


  // ==========================================================
  // FETCH DATA FROM FASTAPI
  // ==========================================================

  useEffect(() => {

    const fetchDistrictRisk = async () => {

      try {

        setLoading(true);

        setError(null);

        console.log(
          "Connecting to DairyGuard backend..."
        );


        const response = await fetch(
          "http://127.0.0.1:8000/api/district-risk"
        );


        // ----------------------------------------------------
        // Check HTTP response
        // ----------------------------------------------------

        if (!response.ok) {

          throw new Error(
            `Backend returned HTTP ${response.status}`
          );

        }


        // ----------------------------------------------------
        // Convert response to JSON
        // ----------------------------------------------------

        const data = await response.json();


        console.log(
          "DairyGuard district risk data:",
          data
        );


        // ----------------------------------------------------
        // Make sure expected data exists
        // ----------------------------------------------------

        if (
          !data ||
          !Array.isArray(data.districts)
        ) {

          throw new Error(
            "Invalid response from /api/district-risk"
          );

        }


        // ----------------------------------------------------
        // Convert array into lookup object
        //
        // Example:
        //
        // {
        //   pune: {...},
        //   nashik: {...},
        //   nagpur: {...}
        // }
        // ----------------------------------------------------

        const statsMap = {};


        data.districts.forEach((district) => {

          const key =
            normalizeDistrictName(
              district.district
            );


          statsMap[key] = district;

        });


        console.log(
          "District stats map:",
          statsMap
        );


        // ----------------------------------------------------
        // Save backend data
        // ----------------------------------------------------

        setDistrictStats(statsMap);

      }


      catch (err) {

        console.error(
          "Failed to load district risk data:",
          err
        );


        setError(
          err.message ||
          "Unable to connect to DairyGuard backend"
        );

      }


      finally {

        setLoading(false);

      }

    };


    fetchDistrictRisk();

  }, []);


  // ==========================================================
  // DISTRICT STYLE
  // ==========================================================

  const districtStyle = (feature) => {

    const districtName =
      feature?.properties?.district;


    const districtKey =
      normalizeDistrictName(
        districtName
      );


    const stats =
      districtStats[districtKey];


    const riskScore =
      Number(
        stats?.risk_score || 0
      );


    return {

      fillColor:
        getDistrictColor(
          riskScore
        ),

      color: "#FFFFFF",

      weight: 1.5,

      fillOpacity: 0.75

    };

  };


  // ==========================================================
  // DISTRICT HOVER
  // ==========================================================

  const onEachDistrict = (
    feature,
    layer
  ) => {

    const districtName =
      feature?.properties?.district;


    const districtKey =
      normalizeDistrictName(
        districtName
      );


    const stats =
      districtStats[districtKey];


    // --------------------------------------------------------
    // Hover events
    // --------------------------------------------------------

    layer.on({

      mouseover: (event) => {

        // Highlight district

        event.target.setStyle({

          weight: 3,

          color: "#1B231E",

          fillOpacity: 0.9

        });


        event.target.bringToFront();


        // ----------------------------------------------------
        // Show district information
        // ----------------------------------------------------

        setSelectedDistrict({

          name:
            districtName,

          farms:
            stats?.farms,

          animals:
            stats?.animals,

          milk_received_liters:
            stats?.milk_received_liters,

          risk_score:
            stats?.risk_score,

          active_risk_signals:
            stats?.active_risk_signals

        });

      },


      mouseout: (event) => {

        // Restore original colour

        event.target.setStyle(
          districtStyle(feature)
        );


        setSelectedDistrict(null);

      }

    });

  };


  // ==========================================================
  // MAP
  // ==========================================================

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


      {/* =====================================================
          LOADING MESSAGE
         ===================================================== */}

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

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.18)",

            fontSize: "13px",

            fontWeight: 600
          }}
        >

          Loading Maharashtra risk data...

        </div>

      )}


      {/* =====================================================
          BACKEND ERROR
         ===================================================== */}

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

            boxShadow:
              "0 4px 12px rgba(0,0,0,0.18)",

            fontSize: "13px",

            fontWeight: 600
          }}
        >

          Backend error: {error}

        </div>

      )}


      {/* =====================================================
          LEAFLET MAP
         ===================================================== */}

      <MapContainer

        center={[
          19.6633,
          75.3280
        ]}

        zoom={7}

        scrollWheelZoom={false}

        style={{
          width: "100%",
          height: "100%"
        }}

      >

        {/* ---------------------------------------------------
            OpenStreetMap
           --------------------------------------------------- */}

        <TileLayer

          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

          attribution="&copy; OpenStreetMap contributors"

        />


        {/* ---------------------------------------------------
            Maharashtra district GeoJSON
           --------------------------------------------------- */}

        <GeoJSON

          /*
           * Changing the key after backend data loads forces
           * Leaflet to recreate the district layers.
           *
           * This ensures hover handlers receive the latest
           * districtStats.
           */

          key={JSON.stringify(districtStats)}

          data={maharashtraGeoJSON}

          style={districtStyle}

          onEachFeature={onEachDistrict}

        />

      </MapContainer>


      {/* =====================================================
          DISTRICT INFORMATION CARD
         ===================================================== */}

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

            boxShadow:
              "0 6px 20px rgba(0,0,0,0.18)"
          }}
        >


          {/* -------------------------------------------------
              District name
             ------------------------------------------------- */}

          <h3
            style={{
              marginTop: 0,

              marginBottom: "14px",

              color: "#1B231E"
            }}
          >

            {selectedDistrict.name}

          </h3>


          {/* -------------------------------------------------
              Farms
             ------------------------------------------------- */}

          <p>

            <strong>Farms:</strong>{" "}

            {selectedDistrict.farms ?? "N/A"}

          </p>


          {/* -------------------------------------------------
              Animals
             ------------------------------------------------- */}

          <p>

            <strong>Animals:</strong>{" "}

            {selectedDistrict.animals ?? "N/A"}

          </p>


          {/* -------------------------------------------------
              Milk received
             ------------------------------------------------- */}

          <p>

            <strong>Milk received:</strong>{" "}

            {selectedDistrict.milk_received_liters != null

              ? Number(
                  selectedDistrict
                    .milk_received_liters
                ).toLocaleString()

              : "N/A"

            }{" "}

            L

          </p>


          {/* -------------------------------------------------
              Risk score
             ------------------------------------------------- */}

          <p>

            <strong>Risk score:</strong>{" "}

            {selectedDistrict.risk_score != null

              ? Number(
                  selectedDistrict.risk_score
                ).toFixed(1)

              : "N/A"

            }

          </p>


          {/* -------------------------------------------------
              Active risk signals
             ------------------------------------------------- */}

          <p>

            <strong>Risk signals:</strong>{" "}

            {selectedDistrict.active_risk_signals ??
              "N/A"}

          </p>


        </div>

      )}

    </div>

  );

}