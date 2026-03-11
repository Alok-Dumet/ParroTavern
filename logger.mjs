// import winston from 'winston';
// import DailyRotateFile from 'winston-daily-rotate-file';

// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.prettyPrint()
//   ),
//   transports: [
//     new winston.transports.File({ filename: 'telemetry.log' }),
//     new DailyRotateFile({
//       filename: 'logs/telemetry-%DATE%.log',
//       datePattern: 'YYYY-MM-DD',
//       maxFiles: '60d',
//     }),
//   ],
// });

// export default logger;