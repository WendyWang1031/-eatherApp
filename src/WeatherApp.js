import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import WeatherCard from "./WeatherCard";
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

const fetchCurrentWeather = () => {
  return fetch(
    "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWA-0179E027-7E79-4DBA-BCF1-1B91C0BF4A7E&format=JSON&StationName=臺北"
  )
    .then((response) => response.json())
    .then((data) => {
      const stationData = data.records.Station[0];
      const weatherContent = stationData.WeatherElement;

      return {
        observationTime: stationData.ObsTime.DateTime,
        stationName: stationData.StationName,
        description: weatherContent.Weather,
        temperature: weatherContent.AirTemperature,
        windSpeed: weatherContent.WindSpeed,
        humid: weatherContent.RelativeHumidity,
      };
    });
};

const fetchWeatherForecast = () => {
  return fetch(
    "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-0179E027-7E79-4DBA-BCF1-1B91C0BF4A7E&format=JSON&StationName=臺北市"
  )
    .then((response) => response.json())
    .then((data) => {
      const stationData = data.records.location[0];

      const weatherContent = stationData.weatherElement.reduce(
        (neededElements, item) => {
          if (
            ["Wx", "PoP", "CI"].includes(item.elementName) &&
            item.time.length > 0
          ) {
            neededElements[item.elementName] =
              item.time[0].parameter.parameterName;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherContent.Wx,
        weatherCode: weatherContent.Wx,
        rainPossibility: weatherContent.PoP,
        comfortability: weatherContent.CI,
      };
    });
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
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    stationName: "",
    description: "",
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true,
  });

  const [currentTheme, setCurrentTheme] = useState("light");

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast(),
      ]);
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      });
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true,
    }));

    fetchingData();
  }, []);

  const moment = useMemo(
    () => getMoment(weatherElement.CountyName),
    [weatherElement.CountyName]
  );

  useEffect(() => {
    console.log("execute function in useEffect.");
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        <WeatherCard
          weatherElement={weatherElement}
          moment={moment}
          fetchData={fetchData}
        />
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
