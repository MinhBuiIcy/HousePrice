require("dotenv").config({
  path: "./.env",
});
require("rootpath")();
const express = require("express");
const bodyParser = require("body-parser");
const router = require("routes/api");
const { swaggerUIServe,swaggerUISetup } = require("kernels/api-docs");

const app = express();
app.disable("x-powered-by");

const corsAllowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const allowAnyOrigin = corsAllowedOrigins.includes("*");

  if (allowAnyOrigin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && corsAllowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(bodyParser.json());
app.use("/", router);
app.use(express.json());

app.use("/api-docs", swaggerUIServe, swaggerUISetup);

module.exports = app
