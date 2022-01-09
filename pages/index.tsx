import type { NextPage } from "next";
import Head from "next/head";
import type { Countries, Event, RawEvent, Sessions } from "../lib/models";
import { ChangeEvent, useEffect, useState } from "react";
import DayPicker from "../components/DayPicker";
import HolidayAllowance from "../components/HolidayAllowance";
import { range } from "../lib/utils/array";

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
    <div style={{ padding: "0 1rem", margin: "0 auto", maxWidth: "960px" }}>
      <Head>
        <title>Pro-rata holiday calculator</title>
        <meta
          name="description"
          content="Calculate how many days leave you can take"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          property="og:image"
          content="https://pro-rata-holiday.netlify.app/android-chrome-512x512.png"
        />
      </Head>
      <h1>Calculating my holiday allowance</h1>
      <h2>
        1. Standard annual leave allowance is 25 days. If yours differs, please
        change this below.
      </h2>
      <p>
        <label htmlFor="allowance">Yearly holiday allowance: </label>
        <select
          id="allowance"
          value={holidayAllowance}
          onChange={updateHolidayAllowance}
        >
          {holidayAllowanceChoices.map((days) => (
            <option key={days} value={days}>
              {days}
            </option>
          ))}
        </select>{" "}
        days
      </p>
      <hr />

      <h2>
        2. Tell us the following information so we can find the correct bank
        holiday dates:
      </h2>

      <p>
        <label htmlFor="division">Your region:</label>{" "}
        <select
          id="division"
          value={selectedDivision}
          onChange={updateDivision}
        >
          {divisions.map(({ division, label }) => (
            <option key={division} value={division}>
              {label}
            </option>
          ))}
        </select>
      </p>
      <p>
        <label htmlFor="year">The year you are calculating for:</label>{" "}
        <select id="year" value={year} onChange={updateYear}>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </p>

      <p
        style={{
          background: "#FFECB3",
          padding: "8px 12px",
          borderRadius: "4px",
        }}
      >
        There are{" "}
        <strong>{divisionHolidays.length} days of public holidays</strong> in{" "}
        {getDivisionLabel(selectedDivision)} during <strong>{year}</strong>
      </p>

      <hr />

      <h2>3. Please select the sessions you will be working in {year}:</h2>

      <DayPicker onChange={(sessions: Sessions) => setSessions(sessions)} />

      <hr />

      <HolidayAllowance
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
