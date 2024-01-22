import { useState, useEffect, useCallback } from "react";

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

const useWeatherApi = () => {
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

  useEffect(() => {
    console.log("execute function in useEffect.");
    fetchData();
  }, [fetchData]);

  return { weatherElement, fetchData };
};

export default useWeatherApi;
