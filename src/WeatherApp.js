import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import WeatherCard from "./WeatherCard";
import useWeatherApi from "./useWeatherApi";
import WeatherSetting from "./WeatherSetting";
import sunriseAndSunsetData from "./sunrise-sunset.json";
import { ThemeProvider } from "@emotion/react";

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};

const getMoment = (CountyName) => {
  const locations = Object.values(
    sunriseAndSunsetData.cwaopendata.dataset.location
  );
  const location = locations.find((data) => data.CountyName === CountyName);
  if (!location || !Array.isArray(location.time)) return null;
  const now = new Date();
  const nowDate = Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/\//g, "-");

  const locationDate =
    location.time && location.time.find((time) => time.Date === nowDate);

  if (!locationDate) return null;

  const sunriseTimestamp = new Date(
    `${locationDate.Date} ${locationDate.SunRiseTime}`
  ).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.Date} ${locationDate.SunSetTime}`
  ).getTime();
  const nowTimeStamp = now.getTime();

  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? "day"
    : "night";
};

const WeatherApp = () => {
  console.log("---invoke function component---");
  const { weatherElement, fetchData } = useWeatherApi();
  const [currentTheme, setCurrentTheme] = useState("light");
  const { stationName } = weatherElement;
  const moment = useMemo(
    () => getMoment(weatherElement.CountyName),
    [weatherElement.CountyName]
  );

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  const [currentPage, setCurrentPage] = useState("WeatherCard");

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting setCurrentPage={setCurrentPage} />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
