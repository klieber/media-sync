import winston from 'winston';
import { format as formatDate } from 'date-fns';

const formatModule = (module, width) => {
  let component = module.replace(/^.*\/([^/]*)$/, '$1');
  return component.substring(0, Math.min(component.length, width)).replace(/^\//, '').padEnd(width);
};

const timestamp = winston.format((info) => {
  info.timestamp = formatDate(new Date(), "yyyy:MM:dd'T'HH:mm:ss.SSSXXXX");
  return info;
});

let format = winston.format.combine(timestamp(), winston.format.errors({ stack: true }), winston.format.json());

if (process.env.NODE_ENV !== 'production') {
  format = winston.format.combine(
    {
      transform: (info) => {
        info.level = info.level.padEnd(5);
        return info;
      }
    },
    winston.format.colorize(),
    timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.printf((info) => {
      // const message = info.metadata.stack ? `${info.message}\n${info.metadata.stack}` : info.message;
      const message = info.message;
      const component = formatModule(info.metadata.module || info.metadata.app, 20);
      return `${info.timestamp} [${info.level}] ${component} : ${message}`;
    })
  );
}

const logger = winston.createLogger({
  level: process.env.MEDIA_SYNC_LOG_LEVEL || 'info',
  silent: process.env.NODE_ENV === 'test',
  format: format,
  defaultMeta: { app: 'media-sync' },
  transports: [new winston.transports.Console()]
});

const create = (metadata) => {
  return typeof metadata === 'string' ? logger.child({ module: metadata }) : logger.child(metadata);
};

module.exports = {
  logger,
  create
};
