// eslint-disable-next-line
type LogType = (...args: any[]) => void;

const logger: {
  log: LogType;
  error: LogType;
  info: LogType;
} = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(...args);
    }
  },
  info: (...args: any[]) => {
    console.log(...args);
  },
  // Add other console methods like console.warn, console.info, etc. if needed
};

export default logger;
