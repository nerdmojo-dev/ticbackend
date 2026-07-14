import morgan from "morgan";
import logger from "../utils/logger.mjs";

morgan.token("colored-status", (req, res) => {
  const status = res.statusCode;

  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // Green

  return status;
});

const format =
  "\x1b[35m:method\x1b[0m " +       // Purple
  "\x1b[36m:url\x1b[0m " +          // Cyan
  ":colored-status " +
  "\x1b[33m:response-time ms\x1b[0m " + // Yellow
  "- :res[content-length] bytes";

export default morgan(format, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});