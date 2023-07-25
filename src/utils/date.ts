export const convertERemizaDateToDate = (date: string) => {
  return new Date(
    Date.parse(
      date.replace(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/, "$3-$2-$1T$4:$5")
    )
  );
};
