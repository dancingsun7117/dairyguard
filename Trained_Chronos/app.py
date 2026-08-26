import streamlit as st
import pandas as pd
import numpy as np
import torch

from chronos import ChronosBoltPipeline


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "Trained_Chronos/chronos_bolt_dairyguard_finetuned"

DATA_PATH = "chronos_training_data_fixed.csv"

CONTEXT_LENGTH = 180


# ============================================================
# PAGE
# ============================================================

st.set_page_config(
    page_title="DairyGuard Forecasting",
    page_icon="🥛",
    layout="wide"
)

st.title("🥛 DairyGuard")
st.subheader("AI-Powered Milk Procurement Forecasting")


# ============================================================
# LOAD MODEL
# ============================================================

@st.cache_resource
def load_model():

    device = "cuda" if torch.cuda.is_available() else "cpu"

    pipeline = ChronosBoltPipeline.from_pretrained(
        MODEL_PATH,
        device_map=device,
        torch_dtype=torch.float32,
        local_files_only=True
    )

    return pipeline, device


try:

    pipeline, device = load_model()

    st.success(
        f"Chronos-Bolt loaded successfully • Device: {device}"
    )

except Exception as e:

    st.error(f"Could not load model: {e}")

    st.stop()


# ============================================================
# LOAD DATA
# ============================================================

@st.cache_data
def load_data():

    df = pd.read_csv(DATA_PATH)

    df["ds"] = pd.to_datetime(df["ds"])

    return df


df = load_data()


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.header("Forecast Settings")

districts = sorted(
    df["unique_id"].unique()
)

selected_district = st.sidebar.selectbox(
    "Select District",
    districts
)

forecast_days = st.sidebar.slider(
    "Forecast Horizon",
    min_value=7,
    max_value=14,
    value=14
)


# ============================================================
# FILTER DISTRICT
# ============================================================

district_df = df[
    df["unique_id"] == selected_district
].sort_values("ds")


st.write(
    f"### 📍 {selected_district} Procurement"
)

col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        "Historical Records",
        len(district_df)
    )

with col2:
    st.metric(
        "Latest Production",
        f"{district_df['y'].iloc[-1]:.2f}"
    )

with col3:
    st.metric(
        "Historical Average",
        f"{district_df['y'].mean():.2f}"
    )


# ============================================================
# FORECAST BUTTON
# ============================================================

if st.button(
    "🔮 Generate Forecast",
    type="primary"
):

    history = district_df["y"].values.astype(
        np.float32
    )

    if len(history) < CONTEXT_LENGTH:

        st.error(
            f"Need at least {CONTEXT_LENGTH} historical observations."
        )

        st.stop()

    context = torch.tensor(
        history[-CONTEXT_LENGTH:],
        dtype=torch.float32
    ).unsqueeze(0)


    # ========================================================
    # FORECAST
    # ========================================================

    with st.spinner("Generating forecast..."):

        with torch.no_grad():

            quantile_preds, _ = pipeline.predict_quantiles(
                context,
                prediction_length=forecast_days,
                quantile_levels=[0.1, 0.5, 0.9]
            )


    # Median forecast
    median = (
        quantile_preds[0, :, 1]
        .cpu()
        .numpy()
    )

    lower = (
        quantile_preds[0, :, 0]
        .cpu()
        .numpy()
    )

    upper = (
        quantile_preds[0, :, 2]
        .cpu()
        .numpy()
    )


    # ========================================================
    # FORECAST TABLE
    # ========================================================

    last_date = district_df["ds"].iloc[-1]

    forecast_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=forecast_days,
        freq="D"
    )


    forecast_df = pd.DataFrame({

        "Date": forecast_dates,

        "Predicted Milk": median,

        "Lower Estimate": lower,

        "Upper Estimate": upper

    })


    # ========================================================
    # RESULTS
    # ========================================================

    st.divider()

    st.subheader("📊 Forecast")

    st.dataframe(
        forecast_df,
        use_container_width=True
    )


    # ========================================================
    # CHART
    # ========================================================

    st.subheader("📈 Milk Procurement Trend")

    historical = district_df[
        ["ds", "y"]
    ].tail(60).copy()

    historical = historical.rename(
        columns={
            "ds": "Date",
            "y": "Milk Production"
        }
    )

    historical = historical.set_index("Date")

    chart_df = pd.DataFrame(
        {
            "Historical": historical["Milk Production"]
        }
    )

    forecast_series = pd.Series(
        median,
        index=forecast_dates,
        name="Forecast"
    )

    chart_df = pd.concat(
        [
            chart_df,
            forecast_series
        ],
        axis=1
    )

    st.line_chart(chart_df)


    # ========================================================
    # SUMMARY
    # ========================================================

    st.subheader("📋 Forecast Summary")

    c1, c2, c3 = st.columns(3)

    with c1:

        st.metric(
            "Average Forecast",
            f"{median.mean():.2f}"
        )

    with c2:

        st.metric(
            "Maximum Forecast",
            f"{median.max():.2f}"
        )

    with c3:

        st.metric(
            "Minimum Forecast",
            f"{median.min():.2f}"
        )