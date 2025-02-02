import { createResponse, createTxtAnswer, startUdpServer } from "denamed";

console.log("UDP Server started");

// Conversion factors
const conversionFactors = {
    "km-mi": 0.621371,
    "mi-km": 1.60934,
    "m-km": 0.001,
    "km-m": 1000,
    "m-in": 39.3701,
    "in-m": 0.0254,
    "m-ft": 3.28084,
    "ft-m": 0.3048,
    "m-cm": 100,
    "cm-m": 0.01,
    "m-mm": 1000,
    "mm-m": 0.001,
    "kg-lb": 2.20462,
    "lb-kg": 0.453592,
    "g-oz": 0.035274,
    "oz-g": 28.3495,
    "kg-g": 1000,
    "g-kg": 0.001,
    "liter-oz": 33.814,
    "oz-liter": 0.0295735,
    "liter-ml": 1000,
    "ml-liter": 0.001,
    "liter-gal": 0.264172,
    "gal-liter": 3.78541,
    "liter-qt": 1.05669,
    "qt-liter": 0.946353,
    "liter-pint": 2.11338,
    "pint-liter": 0.473176,
    "liter-cup": 4.22675,
    "cup-liter": 0.236588,
    "mps-kmph": 3.6,
    "kmph-mps": 0.277778,
    "mps-mph": 2.23694,
    "mph-mps": 0.44704,
    "m2-km2": 0.000001,
    "km2-m2": 1000000,
    "m2-mi2": 3.861e-7,
    "mi2-m2": 2589988.11,
    "m2-ft2": 10.7639,
    "ft2-m2": 0.092903,
    "m2-in2": 1550.0031,
    "in2-m2": 0.00064516,
    "m2-ac": 0.000247105,
    "ac-m2": 4046.85642,
    "m2-hectare": 0.0001,
    "hectare-m2": 10000,
};

const temperatureConversions = {
    "c-f": (celsius) => (celsius * 9/5) + 32,
    "f-c": (fahrenheit) => (fahrenheit - 32) * 5/9,
    "c-k": (celsius) => celsius + 273.15,
    "k-c": (kelvin) => kelvin - 273.15,
    "f-k": (fahrenheit) => (fahrenheit - 32) * 5/9 + 273.15,
    "k-f": (kelvin) => (kelvin - 273.15) * 9/5 + 32,
};

// Function to process queries
// Function to process queries
// Function to process queries
function processQuery(query) {
    try {
      // Log the query to inspect its structure
      console.log("Query:", query);
  
      // Extract the actual query string from the DNS query
      const actualQuery = query.questions[0];
  
      // Check if 'name' exists in the query
      if (!actualQuery || !actualQuery.name) {
        return createTxtAnswer("error", "Invalid query format. Query name is missing.");
      }
  
      console.log("Actual Query Name:", actualQuery.name); // Log the query name
  
      // Clean the query (remove ".unit.fetchme" part)
      const cleanedQuery = actualQuery.name.split(".")[0];
  
      // Regular expression to match value and units
      const regex = /(\d+(\.\d+)?)([a-zA-Z]+)-([a-zA-Z]+)/;
      
      const matches = cleanedQuery.match(regex);
      if (!matches) {
        return createTxtAnswer(actualQuery.name, "Invalid query format. Expected format: <value><unit1>-<unit2>");
      }
  
      const value = parseFloat(matches[1]);
      const sourceUnit = matches[3];
      const targetUnit = matches[4];
  
      // Handle temperature conversions
      const temperatureKey = `${sourceUnit.toLowerCase()}-${targetUnit.toLowerCase()}`;
      if (temperatureConversions[temperatureKey]) {
        const result = temperatureConversions[temperatureKey](value);
        const responseText = `${value}${sourceUnit} = ${result.toFixed(2)}${targetUnit}`;
        return createTxtAnswer(actualQuery, responseText);
      }
  
      // Handle other unit conversions
      const conversionKey = `${sourceUnit.toLowerCase()}-${targetUnit.toLowerCase()}`;
      if (conversionFactors[conversionKey]) {
        const conversionFactor = conversionFactors[conversionKey];
        const result = value * conversionFactor;
        const responseText = `${value}${sourceUnit} = ${result.toFixed(2)}${targetUnit}`;
        return createTxtAnswer(actualQuery, responseText);
      } else {
        return createTxtAnswer(actualQuery, `Conversion from ${sourceUnit} to ${targetUnit} not supported`);
      }
      
    } catch (error) {
      console.error("Error processing query:", error);
      return createTxtAnswer("error", "Invalid query format. Expected format: <value><unit1>-<unit2>");
    }
  }
  
  
// Start UDP server
startUdpServer((query) => {
  const response = processQuery(query);
  console.log(response); // Log the result
  return createResponse(query, [response]); // Ensure the response is returned correctly
}, { port: 8000 });
