import moment from "moment";
import { useTranslation } from "react-i18next";

const useRelativeTime = () => {
  const { t } = useTranslation();

  return (date: any): string => {
    if (!date) return "";

    const now = moment();
    const past = moment(date);
    const diffSeconds = now.diff(past, "seconds");

    if (diffSeconds < 60) return t("time.justNow");

    const diffMinutes = now.diff(past, "minutes");
    if (diffMinutes === 1) return t("time.minute");
    if (diffMinutes < 60) return t("time.minutes", { count: diffMinutes });

    const diffHours = now.diff(past, "hours");
    if (diffHours === 1) return t("time.hour");
    if (diffHours < 24) return t("time.hours", { count: diffHours });

    const diffDays = now.diff(past, "days");
    if (diffDays === 1) return t("time.day");
    if (diffDays < 7) return t("time.days", { count: diffDays });

    const diffWeeks = now.diff(past, "weeks");
    if (diffWeeks === 1) return t("time.week");
    if (diffWeeks < 4) return t("time.weeks", { count: diffWeeks });

    const diffMonths = now.diff(past, "months");
    if (diffMonths === 1) return t("time.month");
    if (diffMonths < 12) return t("time.months", { count: diffMonths });

    const diffYears = now.diff(past, "years");
    if (diffYears === 1) return t("time.year");
    if (diffYears >= 2) return t("time.years", { count: diffYears });

    return moment(date).format("YYYY-MM-DD HH:mm");
  };
};

export default useRelativeTime;
