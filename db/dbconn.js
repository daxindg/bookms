var pgp = require("pg-promise")();

if (process.env.PROD) {
  exports.userconn = exports.guestconn = exports.adminconn = pgp({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  });
} else {
  exports.adminconn = pgp(process.env.DB_URL_ADMIN);
  exports.userconn = pgp(process.env.DB_URL_USER);
  exports.guestconn = pgp(process.env.DB_URL_GUEST);
}
