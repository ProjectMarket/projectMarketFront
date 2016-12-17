module.exports = {
  port: process.env.PORT || "8080",
  files: ["./app/**/*.{html,htm,css,js}"],
  server: { "baseDir": "./" },
  open: false
};