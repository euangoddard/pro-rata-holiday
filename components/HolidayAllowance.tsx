import { FC, useState } from "react";
import { formatNumber } from "../lib/utils/number";
import { Event, Sessions } from "../lib/models";
import styles from "./HolidayAllowance.module.css";
import classNames from "classnames";

interface HolidayVisualizationProps {
  publicHolidays: readonly Event[];
  sessions: Sessions;
  holidayAllowanceDays: number;
  year: number;
}

const proRata = (days: number, sessions: Sessions): number => {
  return (days * sessions.length) / 10;
};

const formatPublicHoliday = (event: Event, workingDays: Set<number>) => {
  const usesAllowance = workingDays.has(event.date.getDay());

  return (
    <li
      key={event.date.valueOf()}
      className={classNames({
        [styles.publicHolidayText]: usesAllowance,
      })}
    >
      {event.title} (
      {event.date.toLocaleDateString(undefined, {
        dateStyle: "full",
      })}
      ) {usesAllowance ? <em>working day</em> : ""}
    </li>
  );
};

const formatDays = (days: number) => {
  if (days === 1) {
    return (
      <>
        <strong>1</strong> day
      </>
    );
  } else {
    return (
      <>
        <strong>{formatNumber(days, 2)}</strong> days
      </>
    );
  }
};

const HolidayAllowance: FC<HolidayVisualizationProps> = ({
  publicHolidays,
  holidayAllowanceDays,
  sessions,
  year,
}) => {
  const proRataDays = proRata(holidayAllowanceDays, sessions);
  const proRataPublicHolidays = proRata(publicHolidays.length, sessions);

  const workingDays = new Set(sessions.map(({ day }) => day));

  const enforcedPublicHolidays = publicHolidays.filter(({ date }) =>
    workingDays.has(date.getDay()),
  ).length;

  const [arePublicHolidaysShown, setArePublicHolidaysShown] = useState(false);

  if (!sessions.length) {
    return (
      <p>
        <em>Choose at least once session to see your allowance</em>
      </p>
    );
  }

  return (
    <article style={{ marginBottom: "16px" }}>
      <h2>My holiday allowance ({year})</h2>

      <p className={styles.tightBottom}>
        You work {sessions.length} sessions per week
      </p>
      <div className={styles.highlight}>
        <p>
          Your pro-rata <strong>holiday allowance</strong> is
        </p>
        <h3>{formatDays(proRataDays)}</h3>
      </div>

      <p className={styles.tightBottom}>
        There are {publicHolidays.length} public holidays this year
      </p>
      <div className={styles.highlight}>
        <p>
          Your <strong>public holiday entitlement</strong> is
        </p>
        <h3>{formatDays(proRataPublicHolidays)}</h3>
      </div>

      <p className={classNames([styles.tightBottom, styles.important])}>
        <strong style={{ textTransform: "uppercase" }}>Important:</strong>{" "}
        Public holidays fall on {formatDays(enforcedPublicHolidays)} you work.
        You must take these as holiday.
      </p>
      {arePublicHolidaysShown ? (
        <>
          <p>
            <button
              className={styles.asLink}
              onClick={() => setArePublicHolidaysShown(false)}
              type="button"
            >
              Hide public holidays in {year}
            </button>
          </p>
          <ol>
            {publicHolidays.map((event) =>
              formatPublicHoliday(event, workingDays),
            )}
          </ol>
        </>
      ) : (
        <p>
          <button
            className={styles.asLink}
            onClick={() => setArePublicHolidaysShown(true)}
            type="button"
          >
            View public holidays in {year}
          </button>
        </p>
      )}

      <div className={styles.inLieu}>
        <p>Additional public holidays in lieu</p>
        <h3>
          {formatDays(
            Math.max(proRataPublicHolidays - enforcedPublicHolidays, 0),
          )}
        </h3>
      </div>
    </article>
  );
};

export default HolidayAllowance;
