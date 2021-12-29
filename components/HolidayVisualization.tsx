import { FC } from "react";
import { formatNumber } from "../lib/utils/number";
import { Event, Sessions } from "../lib/models";
import styles from "./HolidayVisualization.module.css";
import classNames from "classnames";

interface HolidayVisualizationProps {
  publicHolidays: readonly Event[];
  sessions: Sessions;
  holidayAllowanceDays: number;
  year: number;
}

enum HolidayType {
  AnnualLeave,
  PartialAnnualLeave,
  PublicHoliday,
  PartialPublicHoliday,
  EnforcedPublicHoliday,
}

interface Holiday {
  id: string;
  type: HolidayType;
  label: string;
}

const proRata = (days: number, sessions: Sessions): number => {
  return (days * sessions.length) / 10;
};

const calculateHolidays = (
  proRataDays: number,
  proRataPublicHolidays: number,
  enforcedPublicHolidays: number,
): readonly Holiday[] => {
  const partialAnnualLeave = proRataDays - Math.floor(proRataDays);

  const remainingPublicHolidays = Math.max(
    proRataPublicHolidays - enforcedPublicHolidays,
    0,
  );

  const partialPublicHoliday =
    remainingPublicHolidays - Math.floor(remainingPublicHolidays);

  const holidays: Holiday[] = [];

  for (let i = 0; i < Math.floor(proRataDays); i++) {
    holidays.push({
      id: `al-${i}`,
      type: HolidayType.AnnualLeave,
      label: "Annual leave",
    });
  }

  if (partialAnnualLeave) {
    holidays.push({
      id: "al-p",
      type: HolidayType.PartialAnnualLeave,
      label: `${formatNumber(partialAnnualLeave, 2)} day annual leave`,
    });
  }

  for (let i = 0; i < Math.floor(enforcedPublicHolidays); i++) {
    holidays.push({
      id: `eph-${i}`,
      type: HolidayType.EnforcedPublicHoliday,
      label: "Public holiday",
    });
  }

  for (let i = 0; i < Math.floor(remainingPublicHolidays); i++) {
    holidays.push({
      id: `ph-${i}`,
      type: HolidayType.PublicHoliday,
      label: "Public holiday in lieu",
    });
  }

  if (partialPublicHoliday) {
    holidays.push({
      id: "ph-p",
      type: HolidayType.PartialPublicHoliday,
      label: `${formatNumber(
        partialPublicHoliday,
        2,
      )} days public holiday in lieu`,
    });
  }

  return holidays;
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

const HolidayVisualization: FC<HolidayVisualizationProps> = ({
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

  const holidays = calculateHolidays(
    proRataDays,
    proRataPublicHolidays,
    enforcedPublicHolidays,
  );

  return (
    <article>
      <h1>Your holiday allowance</h1>
      <ul>
        <li>
          You are entitled to{" "}
          <span className={styles.annualLeaveText}>
            {formatDays(holidayAllowanceDays)} of annual leave
          </span>
          .
        </li>
        <li>
          There are <strong>{publicHolidays.length}</strong> public holidays in{" "}
          <strong>{year}</strong>
        </li>
        <li>
          You work <strong>{sessions.length}</strong> sessions per week which is
          a pro-rata allowance of{" "}
          <span className={styles.annualLeaveText}>
            {formatDays(proRataDays)} of annual leave
          </span>{" "}
          and {formatDays(proRataPublicHolidays)} of public holidays.
        </li>

        <li>
          <span className={styles.publicHolidayText}>
            <strong>{enforcedPublicHolidays}</strong> fall on days you work
          </span>{" "}
          and you must take these days as public holidays. This leaves you{" "}
          <span className={styles.publicHolidayInLieuText}>
            {formatDays(
              Math.max(proRataPublicHolidays - enforcedPublicHolidays, 0),
            )}{" "}
            in lieu
          </span>
          .
        </li>
      </ul>

      <h3>Public holidays in {year}</h3>
      <ol>
        {publicHolidays.map((event) => formatPublicHoliday(event, workingDays))}
      </ol>

      <h3>Visualization of your leave</h3>
      {holidays.length ? (
        ""
      ) : (
        <p>
          <em>Please select at least one session to view your holiday</em>
        </p>
      )}
      <figure className={styles.days}>
        {holidays.map(({ type, label, id }) => (
          <div
            key={id}
            className={classNames({
              day: true,
              [styles.annualLeave]: type === HolidayType.AnnualLeave,
              [styles.partialAnnualLeave]:
                type === HolidayType.PartialAnnualLeave,
              [styles.publicHolidayInLieu]: type === HolidayType.PublicHoliday,
              [styles.partialPublicHolidayInLieu]:
                type === HolidayType.PartialPublicHoliday,
              [styles.publicHoliday]:
                type === HolidayType.EnforcedPublicHoliday,
            })}
            title={label}
          >
            &nbsp;
          </div>
        ))}
      </figure>
      <h4>Key</h4>
      <dl className={styles.key}>
        <dt className={styles.annualLeave}>&nbsp;</dt>
        <dd>Annual leave</dd>
        <dt className={styles.partialAnnualLeave}>&nbsp;</dt>
        <dd>Annual leave (part day)</dd>
        <dt className={styles.publicHoliday}>&nbsp;</dt>
        <dd>Public holiday</dd>
        <dt className={styles.publicHolidayInLieu}>&nbsp;</dt>
        <dd>Public holiday in lieu</dd>
        <dt className={styles.partialPublicHolidayInLieu}>&nbsp;</dt>
        <dd>Public holiday in lieu (part day)</dd>
      </dl>
      <p>Each block represents a day</p>
    </article>
  );
};

export default HolidayVisualization;
