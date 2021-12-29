import type { NextPage } from "next";
import Head from "next/head";
import type { Countries, Event, RawEvent, Sessions } from "./models";
import { ChangeEvent, useEffect, useState } from "react";
import DayPicker from "../components/DayPicker";
import HolidayVisualization from "../components/HolidayVisualization";
import { range } from "../utils/array";

const getDivisionLabel = (division: string): string => {
  return division
    .split("-")
    .map((word) => {
      if (word === "and") {
        return word;
      } else {
        return `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
      }
    })
    .join(" ");
};

const holidayAllowanceChoices = range(15, 41);

const Form: NextPage<{
  holidays: Countries<RawEvent>;
  years: readonly number[];
}> = ({ holidays, years }) => {
  const countries: Countries = holidays.map((country) => ({
    ...country,
    events: country.events.map((event) => ({
      ...event,
      date: new Date(event.date as any),
    })),
  }));

  const divisions = countries.map(({ division }) => {
    return { division, label: getDivisionLabel(division) };
  });

  const [selectedDivision, setSelectedDivision] = useState(
    divisions[0].division,
  );

  const [divisionHolidays, setDivisionHolidays] = useState<readonly Event[]>(
    [],
  );

  const [year, setYear] = useState(new Date().getFullYear());

  const [sessions, setSessions] = useState<Sessions>([]);

  const [holidayAllowance, setHolidayAllowance] = useState(25);

  useEffect(() => {
    const relevantCountry = countries.find(
      ({ division }) => division === selectedDivision,
    );
    const relevantHolidays = (relevantCountry?.events ?? []).filter(
      ({ date }) => date.getFullYear() === year,
    );
    setDivisionHolidays(relevantHolidays);
  }, [selectedDivision, year]);

  const updateDivision = (event: ChangeEvent): void => {
    setSelectedDivision((event.target as HTMLSelectElement).value);
  };

  const updateYear = (event: ChangeEvent): void => {
    setYear(parseInt((event.target as HTMLSelectElement).value, 10));
  };

  const updateHolidayAllowance = (event: ChangeEvent): void => {
    setHolidayAllowance(
      parseInt((event.target as HTMLSelectElement).value, 10),
    );
  };

  return (
    <div style={{ padding: "0 2rem", margin: "0 auto", maxWidth: "960px" }}>
      <Head>
        <title>Pro-rata holiday calculator</title>
        <meta
          name="description"
          content="Calculate how many days leave you can take"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <label>Division</label>
        <select value={selectedDivision} onChange={updateDivision}>
          {divisions.map(({ division, label }) => (
            <option key={division} value={division}>
              {label}
            </option>
          ))}
        </select>

        <label>Year</label>
        <select value={year} onChange={updateYear}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <DayPicker onChange={(sessions: Sessions) => setSessions(sessions)} />

      <label>
        Holiday allowance (days)
        <select value={holidayAllowance} onChange={updateHolidayAllowance}>
          {holidayAllowanceChoices.map((days) => (
            <option key={days} value={days}>
              {days}
            </option>
          ))}
        </select>
      </label>
      <HolidayVisualization
        holidayAllowanceDays={holidayAllowance}
        publicHolidays={divisionHolidays}
        sessions={sessions}
        year={year}
      />
    </div>
  );
};

export default Form;

export async function getServerSideProps() {
  const res = await fetch("https://www.gov.uk/bank-holidays.json");
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  const holidays: Countries<RawEvent> = Object.values(data);
  const years = new Set(
    holidays
      .flatMap(({ events }) => events)
      .map(({ date }) => new Date(date).getFullYear()),
  );
  return {
    props: { holidays, years: Array.from(years) },
  };
}
